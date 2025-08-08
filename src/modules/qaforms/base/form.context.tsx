import { createContext, useContext, useState, useEffect, ReactNode, FC, useMemo } from 'react'
import { loadForms, saveForms, resetQA, fieldsToRef } from '../../../lib/utils/qa/buildQA'
import { FormField, Form, QAForms, FormRef, FormError, Apps, FormMetadata } from '../../../lib/types/forms.types'
import { FieldValues, FormProvider, useForm, UseFormReturn, useController } from 'react-hook-form'
import { useMAFContext } from '../../../maf-api'
import { WarningFillIcon } from '@nielsen-media/maf-fc-icons'
import Flex from '@nielsen-media/maf-fc-flex'
import { useDataContext } from '../../../lib/context/data.context'
import { isEmpty, sleep } from '../../../lib/utils/helpers'
import { formatDateTime } from '../../../lib/utils/formatDateTime'
import { validateForms } from '../../../lib/utils/qa/validateQA'
import { buildFormsSubmission } from '../../../lib/utils/qa/submitQA'
import { Loading } from '../../../lib/components/feedback/LoaderSpinner'
import { HookForm, HookFormController } from '@nielsen-media/maf-fc-foundation'
import { emailErrorReport } from '../../../lib/maf-api/services/email.service'
import { submitForms } from '../../../lib/maf-api/services/qa.service'
import axios from 'axios'

export interface FormContextProps {
	userData: Pick<FormMetadata, 'qrID' | 'siteName'>
	methods: UseFormReturn<FieldValues, any>
	qaForms: QAForms
	activeForm: Form
	activeFormRef: FormRef
	activeFields: FormField[]
    formErrors: FormError[]
	setActiveForm: (formID: number) => void
	updateActiveForm: (form: Form) => void
	createNewForm: () => void
	deleteCurrentForm: () => void
	updateField: (name: string, value?: any) => void
	setDefaultField: (name: string, value?: any) => void
	toSubmit: boolean
    isSubmitting: boolean
    submitProgress: number
	isSuccessful: boolean
	submissionMessage: string
	onSubmit: () => Promise<void>
	exit: () => void
	cancelSubmission: () => void
}

export interface FormProviderProps {
	children: ReactNode
	userData: Pick<FormMetadata, 'qrID' | 'siteName'>
	appID: keyof Apps
	formFields: FormField[]
}

// Create the context to manage QA monitoring activities
const FormContext = createContext<FormContextProps>(null)

// ------------------------------------------------------------------------------- //

// Main Form Context Provider for each section of the form (Form Details & Form Body)
export const QAFormProvider: FC<FormProviderProps> = ({ children, userData, appID, formFields }) => {
	const {
		actions: { navigate },
		notifier: { dialog }
	} = useMAFContext()

	const { dataLoaded, apps, currentUser } = useDataContext()

	// Loads the QAForms data once fields and user data are fetched
    const fields: FormField[] = formFields
	const initialFormData: QAForms = loadForms(appID, userData, fields)
	const [qaForms, setQaForms] = useState<QAForms>(initialFormData)

	// immediately navigate to the active form
	useEffect(() => {
		const activeForm = getActiveForm()
		if (activeForm) navigate({ appState: { activeFormID: activeForm.formID } })
	}, [])

	// register default field values in form (if existing forms, load any current default fields from most recent active form)
	const initialAttributeFields: FormField[] = initialFormData.forms?.find((form) => form.formID === initialFormData.activeFormID).fields
		.filter(field => ["form_attribute", 'form_toggle'].includes(field.fieldType))
	const initialDefaultFieldMap = new Map(initialAttributeFields.map(field => [field.id, field]))
	const initialDefaultFields: FormField[] = fields.map(field => initialDefaultFieldMap.get(field.id) || field)

	const [defaultFields, setDefaultFields] = useState<FormField[]>(initialDefaultFields)
	const methods = useForm<FieldValues>(fieldsToRef(initialDefaultFields))

    // Compute a memoized array of form errors
    const formErrors: FormError[] = useMemo(() => {
		const formRefList: FormRef[] = qaForms.forms.map(form => form.formRef)
		return validateForms(appID, defaultFields, formRefList)
	}, [qaForms.forms])

	// Updates the sessionStorage on form change
	useEffect(() => { saveForms(appID, qaForms) }, [qaForms])

	// Setter method for Active Form & navigate to new active form
	const setActiveForm = (formID: number) => {
		setQaForms((prev) => ({ ...prev, activeFormID: formID }))
		navigate({ appState: { activeFormID: formID } })
	}

	// Setter method for updating Active Form
	const updateActiveForm = (activeForm: Form) => { 
		setQaForms(prev => ({
			...prev, 
			forms: prev.forms.map(form => {
				if (form.formID === activeForm.formID) return activeForm
				return form
			})
		}))
	}

	// Getter method for Active Form
	const getActiveForm = (): Form => { return qaForms.forms?.find((form) => form.formID === qaForms.activeFormID) }

	// Setter method for updating form field values
	const updateField = (name:string, value:string | number | null | boolean) => {
        // replace empty strings or undefined values with null
        const isEmptyUndefined = (typeof value === "string" && value === "") || value === undefined
        const updatedValue = isEmptyUndefined ? null : value
        
		const activeForm = getActiveForm()
		const updatedFormRef = {
			...activeForm.formRef,
			[name]: updatedValue
		}
        const updatedFields = activeForm.fields.map((field) => {
            if (field.label === name) {
                if (field.fieldType === "form_attribute" || field.fieldType === 'form_toggle') setDefaultField(name, updatedValue)
                return { ...field, value: updatedValue }
            }

            return field
        })

        updateActiveForm({ ...activeForm, fields: updatedFields, formRef: updatedFormRef })
	}

	// Setter method for updating default form field values
	const setDefaultField = (name:string, value:string | number | null | boolean) => {
        setDefaultFields(prev => prev.map((field) => {
			if (field.label === name) field.value = value
			return field
		}))
	}

	useEffect(() => {console.log("defaultFields", defaultFields)}, [defaultFields])
	useEffect(() => {console.log("activeFormRef", getActiveForm().formRef)}, [getActiveForm().formRef])
	useEffect(() => {console.log("formFields", getActiveForm().fields)}, [getActiveForm().fields])

	// Create new form and set it to Active and the previous form to Inactive
	const createNewForm = () => {
		let newFormID: number
		if (!qaForms.forms || qaForms.forms.length === 0) newFormID = 1
		else {
			const maxFormID = Math.max(...qaForms.forms.map(form => form.formID))
			newFormID = maxFormID + 1
		}

		const { formattedDate, formattedTime } = formatDateTime(new Date())
		const newForm: Form = {
			formID: newFormID,
			metadata: {
				recordDate: formattedDate, 
				recordTime: formattedTime,
				...userData
			},
			formRef: { form_id: newFormID, ...fieldsToRef(defaultFields) },
			fields: defaultFields
		}
		
		setQaForms({ forms: [...qaForms.forms, newForm], activeFormID: newFormID }) //setQaForms({ ...qaForms, forms: [...qaForms.forms, newForm], activeFormID: newFormID })
		navigate({ appState: { activeFormID: newFormID } })
	}

	// Deleting current form and setting the previous form to Active
	const deleteCurrentForm = () => {
		const deleteForm = () => {
			const { forms, activeFormID } = qaForms
			const formActiveNdx = forms.findIndex(form => form.formID === activeFormID) // index of currently active form
			const updatedForms = forms.filter(form => form.formID != activeFormID) // delete active form

			let newActiveForm: Form
			if (formActiveNdx > 0) {
				newActiveForm = updatedForms[formActiveNdx - 1] // set Active to the previous form if exists
			} else {
				newActiveForm = updatedForms[0] // set Active to the first form
			}
			
			setQaForms({ forms: updatedForms, activeFormID: newActiveForm.formID })
			navigate({ appState: { activeFormID: newActiveForm.formID } })
		}

		dialog.show('Are you sure you want to delete?', {
			icon: WarningFillIcon,
			variant: dialog.variant.danger,
			message: 'Are you sure you want to delete the current form? This process cannot be undone.',
			buttons: {
				confirm: {
					onClick: () => deleteForm(),
					text: 'Delete'
				}
			}
		})
	}

	// Global submit event
	const [toSubmit, setToSubmit] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const [submitProgress, setSubmitProgress] = useState<number>(0)
	const [isSuccessful, setIsSuccessful] = useState<boolean>(undefined)
	const [submissionMessage, setSubmissionMessage] = useState<string>("")
	const [totalSubmittedIDs, setTotalSubmittedIDs] = useState<number[]>([])
	const onSubmit = async () => {
		setToSubmit(true)

		if (formErrors.length > 0) {
			setIsSuccessful(false)
			setSubmissionMessage(`Errors found in forms. Please ensure that all forms are completed correctly before submitting.`)
		} else {
			const formsToSubmit = buildFormsSubmission(appID, qaForms.forms)
			console.log("Forms to be submitted: ", formsToSubmit)

			try {
                setIsSubmitting(true)

                let BATCHSIZE = 2
                for (let i = 0; i < formsToSubmit.length; i += BATCHSIZE) {
                    const batchNumber = (i / BATCHSIZE) + 1
                    var batch = formsToSubmit.slice(i, i + BATCHSIZE)
                    const batchIDs: number[] = batch.map(form => form.form_id)
                    batch = batch.map(({form_id, ...restOfForm}) => restOfForm) // delete temp form ID before submitting
                    const isLastBatch = (i + BATCHSIZE >= formsToSubmit.length)

                    console.log(`Processing batch number ${batchNumber}:`, batch, batchIDs)
                    await submitForms(appID, batch)

					setSubmitProgress((prev) => prev += batchIDs.length)
					console.log(`Successfully submitted batch ${batchNumber}.`)
					setTotalSubmittedIDs((prev) => prev.concat(batchIDs))

                    if (!isLastBatch) { // No need to sleep after the very last batch
                        console.log(`Pausing for 500ms before next batch...`)
                        await sleep(500) // Wait for 500 milliseconds
                    }

					if (isLastBatch) {
						console.log("All forms have been submitted successfully.")
						setIsSuccessful(true)
					}
                }
            } catch (error) {
				var errorMessage: string
				if (axios.isAxiosError(error)) {
					setSubmissionMessage(`Unable to submit forms: ${error.code} (${error.status})`)

					if (error.response) errorMessage = `An API error occured while submitting the forms. See error: ${error.message}. ${error.response.data?.message}`
					else errorMessage = `An unexpected API error occured while submitting the forms. No response received.`
				} else {
					setSubmissionMessage(`Unable to submit forms: System error occured.`)
					errorMessage = `System error occured while submitting the forms. See error: ${error}`
				}
				
				setIsSubmitting(false)
                setIsSuccessful(false)
				console.log(errorMessage)
                emailErrorReport(currentUser.fullName, 'Forms submission attempt', errorMessage)
            } finally {
				console.log(`${totalSubmittedIDs.length} forms submitted and ready to be deleted from local storage.`)
				const updatedForms = qaForms.forms.filter(form => !totalSubmittedIDs.includes(form.formID))?.sort((a, b) => a.formID - b.formID)
				const updatedLastFormID = updatedForms[-1]?.formID //.findLast(form => form.formID) // newly last form ID
				console.log("updatedForms, last formID", updatedForms, updatedLastFormID)
				
				// if (updatedLastFormID) setQaForms({ activeFormID: updatedLastFormID, forms: updatedForms}) // set Active to the previous form if exists

                setIsSubmitting(false)
            }
		}
	}

	const exit = () => {
        resetSubmission()
        console.log(`Exiting ${apps[appID]} QA monitoring form...`)
        resetQA(appID) // delete item in localStorage
        window.location.reload() // refresh the page
    }

	const resetSubmission = () => {
		setSubmissionMessage("")
		setIsSuccessful(undefined)
		setIsSubmitting(false)
		setToSubmit(false)
		setSubmitProgress(0)
		setTotalSubmittedIDs([])
	}

	// loading state
	if (!dataLoaded) return <Flex justifyContent='center' alignContent='center'><Loading id="qa-form-loading" loaderText='Loading QA Monitoring...'/></Flex>
	
	return (
		<FormContext.Provider value={{
			userData,
			methods,
			qaForms,
			activeForm: getActiveForm(),
			activeFields: getActiveForm().fields,
			activeFormRef: getActiveForm().formRef,
            formErrors,
			setActiveForm,
			updateActiveForm,
			updateField,
			setDefaultField,
			createNewForm,
			deleteCurrentForm,
			onSubmit,
			toSubmit,
			isSubmitting,
            submitProgress,
			isSuccessful,
			submissionMessage,
			exit,
			cancelSubmission: resetSubmission
			}}
		>
			<form onSubmit={(e) => e.preventDefault()}> {/* methods.handleSubmit(onSubmit) */}
				<FormProvider {...methods}>
					{children}
				</FormProvider>
			</form>
		</FormContext.Provider>
	)
}

// Custom hook to use the form context
export const useFormContext = () => {
  const context = useContext(FormContext)
  if (!context) throw new Error("useFormContext must be used within a FormProvider")
  return context
}
