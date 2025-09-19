import React, { createContext, useContext, useState, useEffect, FC, useMemo } from 'react'
import { loadAIForms, saveAIForms, resetAIQA, fieldsToRef } from '../../../lib/utils/qa/buildQA'
import { FormField, Form, FormRef, FormError, FormMetadata, QAFormsAI } from '../../../lib/types/forms.types'
import { FieldValues, FormProvider, useForm, UseFormReturn, useController } from 'react-hook-form'
import { queryClient, useMAFContext } from '../../../maf-api'
import Flex from '@nielsen-media/maf-fc-flex'
import { useDataContext } from '../../../lib/context/data.context'
import { FETCHSTATUS, formatTableValue, isEmpty, sleep } from '../../../lib/utils/helpers'
import { formatDateTime } from '../../../lib/utils/formatDateTime'
import { validateForms } from '../../../lib/utils/qa/validateQA'
import { buildFormsSubmission, buildFormSubmission } from '../../../lib/utils/qa/submitQA'
import { Loading } from '../../../lib/components/feedback/LoaderSpinner'
import { HookForm, HookFormController } from '@nielsen-media/maf-fc-foundation'
import { emailErrorReport } from '../../../lib/maf-api/services/email.service'
import { submitAIFormEdits, updateEditedAIForms } from '../../../lib/maf-api/services/qa.service'
import axios, { AxiosError } from 'axios'
import { FormContextProps, FormProviderProps } from './form.context'
import { PartialPickerDate } from '@nielsen-media/maf-fc-date-picker'
import { fetchAIForms, ReportAPIParams } from '../../../lib/maf-api/services/report.service'
import { FormChange } from '../../../lib/types/edit.types'
import { FiltersItems } from '@nielsen-media/maf-fc-sticky-header-filters/dist/types/src/types'
import Chip from '@nielsen-media/maf-fc-info-chip'
import { DEVIATIONCATEGORY } from './constants'
import reportKeys from '../../../lib/maf-api/query-keys/report.keys'
import { useQuery } from 'react-query'
import { buildAIEditsSubmission } from '../../../lib/utils/qa/editQA'

export interface FormAIContextProps extends Omit<FormContextProps, 'createNewForm' | 'deleteCurrentForm' | 'setDefaultField' | 'onSubmit'> {
	dateSetting: 'single' | 'range'
	setDateSetting: React.Dispatch<React.SetStateAction<'single' | 'range'>>
	recordDate: PartialPickerDate
	setRecordDate: React.Dispatch<React.SetStateAction<PartialPickerDate>>
	recordDateRange: [PartialPickerDate, PartialPickerDate]
	setRecordDateRange: React.Dispatch<React.SetStateAction<[PartialPickerDate, PartialPickerDate]>>
	riID: string
	setRI: React.Dispatch<React.SetStateAction<string>>
	queryParams: ReportAPIParams
	setQueryParams: React.Dispatch<React.SetStateAction<ReportAPIParams>>
	resetQuery: () => void
	formChanges: FormChange[]
	clearAllEdits: () => void
	queryStatus: FETCHSTATUS
	filterItems: FiltersItems[]
	setFilterItems: React.Dispatch<React.SetStateAction<FiltersItems[]>>
	filteredData: QAFormsAI
	defaultFields: FormField[]
	submitActionMessage: string
	totalSubmission: number
	onSubmitCurrent: () => void
	onSubmitAll: () => void
}

// Create the context to manage QA monitoring activities
const AIFormContext = createContext<FormAIContextProps>(null)

// ------------------------------------------------------------------------------- //

// Main Form Context Provider for each section of the form (Form Details & Form Body)
export const QAFormAIProvider: FC<FormProviderProps> = ({ children, userData, appID, formFields }) => {
	const { actions: { navigate } } = useMAFContext()
	const { dataLoaded, apps, currentUser } = useDataContext()

	// Global useStates for running form query
	const [dateSetting, setDateSetting] = useState<'single'|'range'>('single')
	const [recordDate, setRecordDate] = useState<PartialPickerDate>(undefined)
	const [recordDateRange, setRecordDateRange] = useState<[PartialPickerDate, PartialPickerDate]>([undefined, undefined])
	const [riID, setRI] = useState<string>('')
	const [queryParams, setQueryParams] = useState<ReportAPIParams>(null)

	// Loads the QAForms data once fields and user data are fetched
    const fields: FormField[] = formFields
	const methods = useForm<FieldValues>(fieldsToRef(fields))

	const initialFormData: QAFormsAI = loadAIForms(appID)
	const [qaForms, setQaForms] = useState<QAFormsAI>(initialFormData)

	const defaultFilterData = [
        { title: 'Call Type', label: null },
        { title: 'Frame Code', label: null },
        { title: 'Deviation Category', label: null, chip: { label: '0', variant: Chip.Variant.neutral } },
        { title: 'Scoring Category', label: null, chip: { label: '0', variant: Chip.Variant.neutral } },
    ]
	const [filterItems, setFilterItems] = useState<FiltersItems[]>(defaultFilterData)

	// Compute a memoized state of the displayed form data on filter change
    const filteredData = useMemo(() => {
		if (qaForms.forms.length === 0) return { activeFormID: undefined, forms: [], queryCache: [] }

		const activeFilterItems = filterItems.filter(filter => !!filter.label) // only search with non-null filter items
		if (activeFilterItems.length === 0) return qaForms
		
		const activeFilterCalltypes = new Set(activeFilterItems.find(filter => filter.title === "Call Type")?.label.split(", ") || [])
		const activeFilterFramecodes = new Set(activeFilterItems.find(filter => filter.title === "Frame Code")?.label.split(", ") || [])
		const activeFilterScoring = new Set(activeFilterItems.find(filter => filter.title === "Scoring Category")?.label.split(", ") || [])
		const activeFilterDeviations = new Set(activeFilterItems.find(filter => filter.title === "Deviation Category")?.label.split(", ") || [])

		const formsWithCallFrame = qaForms.forms.filter(form => {
			const hasCalltype = activeFilterCalltypes.size === 0 || activeFilterCalltypes.has('All') || activeFilterCalltypes.has(form.formRef.call_type_id)
			const hasFramecode = activeFilterFramecodes.size === 0 || activeFilterFramecodes.has('All') || activeFilterFramecodes.has(form.formRef.frame_code_id)
			return hasCalltype && hasFramecode
		})

		const finalFilteredForms: Form[] = formsWithCallFrame.map(form => {
			const filteredFields = form.fields.filter(field => {
				let hasScoring = true
				let hasDeviation = true

				if (field.fieldType === "scoring_dropdown") {
					hasScoring = activeFilterScoring.size === 0 || activeFilterScoring.has('All') || activeFilterScoring.has(field.name)
					if (field.value !== null && activeFilterDeviations.size > 0) {
						const result = typeof field.value === 'object' 
							? Object.entries(form.formRef[field.label]).find(([key, value]) => key.endsWith("-result"))[1] as number
							: (field.value === "CORRECT" ? 1 : -1)
						const deviationLabel = DEVIATIONCATEGORY.find(catg => catg.value === result)?.label
						hasDeviation = activeFilterDeviations.has('All') || activeFilterDeviations.has(deviationLabel)
					} else hasDeviation = false
				}

				return hasScoring && hasDeviation
			})

			return { ...form, fields: filteredFields }
		})

		return { 
			activeFormID: finalFilteredForms.findLast(form => form)?.formID, 
			forms: finalFilteredForms, 
			queryCache: qaForms.queryCache, 
			formChanges: qaForms.formChanges 
		}
	}, [qaForms.forms, filterItems]) as QAFormsAI

	// Compute a memoized array of form errors
    const formErrors: FormError[] = useMemo(() => {
		if (qaForms.forms.length) {
			const formRefList: FormRef[] = qaForms.forms.map(form => form.formRef)
			return validateForms(appID, fields, formRefList)
		}
		return []
	}, [qaForms.forms])

	const { isLoading, isError, isSuccess } = useQuery<any[], AxiosError>({
		queryKey: reportKeys.aiForms(appID, queryParams),
		queryFn: () => fetchAIForms(appID, queryParams),
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		enabled: !!queryParams,
		onSuccess: (data) => { // Updates the qaForms data storage
			if (data && data.length > 0) {
				const newAIFormData: Form[] = data.map((form, ndx) => {
					const { formattedDate, formattedTime } = formatDateTime(new Date())
					const metadata: FormMetadata = {
						recordDate: formattedDate, 
						recordTime: formattedTime,
						...userData
					}

					const updatedForm: Form = {
						formID: ndx+1,
						metadata: metadata,
						fields: fields.map((field) => ({
							...field,
							value: form[field.label]
						})),
						formRef: { form_id: ndx+1, ...form }
					}

					return updatedForm
				})

				setQaForms({ forms: newAIFormData, activeFormID: 1, queryCache: newAIFormData, formChanges: [] })
			} else {
				setQaForms({ forms: [], activeFormID: undefined, queryCache: [], formChanges: [] }) // no qaForms data
			}
		}
	})

	const queryStatus = useMemo((): FETCHSTATUS => {
		if (queryParams) {
			if (isLoading) return 'loading'
			if (isError) return 'error'
			if (isSuccess) return !isEmpty(qaForms.forms) ? 'success' : 'no-data'
		}

		if (!isEmpty(filteredData.forms)) return 'success'
		if (isEmpty(qaForms.queryCache)) return 'idle'
		return 'no-data'
	}, [queryParams, isLoading, isSuccess, isError, qaForms.forms, filteredData, qaForms.queryCache])

	// immediately navigate to the active form if already loaded
	useEffect(() => {
		const activeForm = getActiveForm()
		if (activeForm) navigate({ appState: { activeFormID: activeForm.formID } })
	}, [])

	// Getter method for Active Form
	const getActiveForm = (): Form => qaForms.forms?.find((form) => form.formID === qaForms.activeFormID) || null

	// Setter method for Active Form & navigate to new active form
	const setActiveForm = (formID: number) => {
		if (qaForms.forms.length) {
			setQaForms((prev) => ({ ...prev, activeFormID: formID }))
			navigate({ appState: { activeFormID: formID } })
		}
	}

	// Setter method for updating Active Form
	const updateActiveForm = (activeForm: Form) => { 
		setQaForms(prev => ({
			...prev, 
			forms: prev.forms.map(form => (form.formID === activeForm.formID ? activeForm : form))
		}))
	}

	// Setter method for storing form changes
    const updateFormChange = (name: string, newValue: any) => {
		const activeForm = getActiveForm()
		if (!activeForm) return

        const updatedNewValue = (typeof newValue === 'string' && newValue === "") ? null : newValue // replace empty strings with null
        const originalValue = qaForms.queryCache.find((form) => form.formID === activeForm.formID)?.formRef[name]
		const hasValueChanged = JSON.stringify(updatedNewValue) !== JSON.stringify(originalValue)
		console.log("original, new value", originalValue, updatedNewValue)
		console.log("hasvalueChanged", hasValueChanged)

		setQaForms(prevQAForms => {
			const prevChanges = prevQAForms.formChanges || []
            let newChanges = [...prevChanges]

			// only update if the value has actually changed
			if (!hasValueChanged) { // delete form change if present
				newChanges = prevChanges.filter(change => !(change.form_id === activeForm.formRef.ai_record_number && change.field_name === name))
			} else {
				const prevChangeNdx = prevChanges.findIndex(change => change.form_id === activeForm.formRef.ai_record_number && change.field_name === name)
				
				if (prevChangeNdx !== -1) { // if previously changed, update form change details
					newChanges.map((change, ndx) => {
						return ndx === prevChangeNdx 
							? { ...change, new_value: formatTableValue(updatedNewValue) }
							: change
					})
				} else { // Add new form change entry
					const newChange = {
						form_id: activeForm.formRef.ai_record_number,
						field_id: fields.find(field => field.label === name)?.id,
						field_name: name,
						old_value: formatTableValue(originalValue),
						new_value: formatTableValue(updatedNewValue)
					}
					
					newChanges = [ ...prevChanges, newChange ]
				}
			}

			return { ...prevQAForms, formChanges: newChanges }
		})
    }

	// Setter method for updating form field values
	const updateField = (name:string, value:any) => {
        // replace empty strings or undefined values with null
        const isEmptyUndefined = (typeof value === "string" && value === "") || value === undefined
        const updatedValue = isEmptyUndefined ? null : value

		const activeForm = getActiveForm()
		const currentValue = activeForm.formRef[name]
		if (JSON.stringify(value) === JSON.stringify(currentValue)) return
		
		updateFormChange(name, updatedValue)
        
		const updatedFormRef = {
			...activeForm.formRef,
			[name]: updatedValue
		}
        const updatedFields = activeForm.fields.map((field) => {
            if (field.label === name) return { ...field, value: updatedValue }
            return field
        })

        updateActiveForm({ ...activeForm, fields: updatedFields, formRef: updatedFormRef })
	}

	// Updates the sessionStorage on form change
	useEffect(() => { saveAIForms(appID, qaForms) }, [qaForms])

	// Global submit event
	const [toSubmit, setToSubmit] = useState<boolean>(false)
	const [isSaving, setIsSaving] = useState<boolean>(false)
	const [totalSubmission, setTotalSubmission] = useState<number>(0)
	const [submitProgress, setSubmitProgress] = useState<number>(0)
	const [isSuccessful, setIsSuccessful] = useState<boolean>(undefined)
	const [submissionMessage, setSubmissionMessage] = useState<string>("")
	const [submitActionMessage, setSubmitActionMessage] = useState<string>("")

	const onSubmitError = (error: any, action: string) => {
		var errorMessage: string
		if (axios.isAxiosError(error)) {
			setSubmissionMessage(`Unable to ${action}: ${error.code} (${error.status})`)

			if (error.response) errorMessage = `An API error occured to ${action}. See error: ${error.message}. ${error.response.data?.message}`
			else errorMessage = `An unexpected API error occured to ${action}. No response received.`
		} else {
			setSubmissionMessage(`Unable to ${action}: System error occured.`)
			errorMessage = `System error occured to ${action}. See error: ${error}`
		}
		
		setIsSaving(false)
		setIsSuccessful(false)
		console.log(errorMessage)
		emailErrorReport(currentUser.fullName, 'AI forms submission attempt', errorMessage)
	}

	const submitTransactions = async (changes: FormChange[]): Promise<number[]> => {
		const finalChanges = buildAIEditsSubmission(currentUser.qrID, appID, changes, [24])
		console.log("Audit transactions to be submitted: ", finalChanges)
		setSubmitActionMessage("Submitting edit transactions...")

		try {
			let totalSubmittedAudits = []
			setIsSaving(true)

			let BATCHSIZE = 2
			for (let i = 0; i < finalChanges.length; i += BATCHSIZE) {
				const batchNumber = (i / BATCHSIZE) + 1
				const batch = finalChanges.slice(i, i + BATCHSIZE)
				const batchIDs = batch.map((audit) => finalChanges.findIndex((change) => change === audit))
				const isLastBatch = (i + BATCHSIZE >= finalChanges.length)

				console.log(`Processing batch number ${batchNumber}:`, batch)
				await submitAIFormEdits(appID, batch)

				setSubmitProgress((prev) => prev += batchIDs.length)
				console.log(`Successfully submitted batch ${batchNumber}.`)
				totalSubmittedAudits.push(...batchIDs)

				if (!isLastBatch) { // No need to sleep after the very last batch
					console.log(`Pausing for 500ms before next batch...`)
					await sleep(500) // Wait for 500 milliseconds
				}

				if (isLastBatch) {
					console.log("All edit transaction(s) have been submitted successfully.", totalSubmittedAudits)
					setIsSuccessful(true)
				}
			}

			console.log(`${totalSubmittedAudits.length} audit(s) submitted.`)
			setToSubmit(false) // end saving after audit submission attempt
			return totalSubmittedAudits
		} catch (error) { 
			onSubmitError(error, 'submit AI transaction(s)')
			return []
		}
	}

	const saveForm = async () => {
		const activeForm = getActiveForm()
		const totalSteps = 1 + qaForms.formChanges.filter(change => change.form_id === activeForm.formRef.ai_record_number).length
		setTotalSubmission(totalSteps)
		setToSubmit(true)
		
		if (formErrors.some(error => error.formID === activeForm.formID)) {
			setIsSuccessful(false)
			setSubmissionMessage(`Errors found in current form. Please ensure that the form is completed correctly before submitting.`)
		} else {
			let savedID: number = undefined
			setSubmitActionMessage("Saving the current form...")
			const formToSubmit = buildFormSubmission(appID, activeForm)
			console.log("Form to be submitted: ", formToSubmit)

			try {
                setIsSaving(true)
				const { form_id, ...restOfForm } = formToSubmit
				const updatedForm = restOfForm // delete temp form ID before submitting

                await updateEditedAIForms(appID, [updatedForm])

				console.log(`Successfully submitted form ${activeForm.formID}.`)
				savedID = activeForm.formRef.ai_record_number
            } catch (error) {
				onSubmitError(error, 'save AI form') 
			} finally {
				if (savedID) {
					const finalFilteredChanges = qaForms.formChanges.filter(change => change.form_id === savedID)
				
					if (finalFilteredChanges) {
						await submitTransactions(finalFilteredChanges).then((successfulAudits) => {
							if (successfulAudits.length === finalFilteredChanges.length) {
								console.log("All edit transactions have been successfully submitted.")
								setQaForms(prevQaForms => ({...prevQaForms, formChanges: []}))
								setIsSuccessful(true)
							} else {
								const totalFailedAudits = finalFilteredChanges?.filter((change, ndx) => !successfulAudits.includes(ndx))
								console.warn("Some edit transactions have failed:", totalFailedAudits)
								setQaForms(prevQaForms => ({...prevQaForms, formChanges: totalFailedAudits}))
								setIsSuccessful(false)
							}
						})
					}
				}

				setIsSaving(false) // end saving session
				queryClient.invalidateQueries({ queryKey: reportKeys.aiForms(appID, queryParams) }) // invalidate current query to refetch data
			}
		}
	}

	const saveAllForms = async () => {
		const totalSteps = qaForms.forms.length + qaForms.formChanges.length
		setTotalSubmission(totalSteps)
		setToSubmit(true)

		if (formErrors.length > 0) {
			setIsSuccessful(false)
			setSubmissionMessage(`Errors found in forms. Please ensure that all forms are completed correctly before submitting.`)
		} else {
			let totalSavedIDs: number[] = []
			setSubmitActionMessage("Saving all forms...")
			const formsToSubmit = buildFormsSubmission(appID, qaForms.forms)
			console.log("Forms to be submitted: ", formsToSubmit)

			try {
                setIsSaving(true)

                let BATCHSIZE = 2
                for (let i = 0; i < formsToSubmit.length; i += BATCHSIZE) {
                    const batchNumber = (i / BATCHSIZE) + 1
                    var batch = formsToSubmit.slice(i, i + BATCHSIZE)
                    const batchIDs: number[] = batch.map(form => form.ai_record_number)
                    batch = batch.map(({form_id, ...restOfForm}) => restOfForm) // delete temp form ID before submitting
                    const isLastBatch = (i + BATCHSIZE >= formsToSubmit.length)

                    console.log(`Processing batch number ${batchNumber}:`, batch, batchIDs)
                    await updateEditedAIForms(appID, batch)

					setSubmitProgress((prev) => prev += batchIDs.length)
					console.log(`Successfully submitted batch ${batchNumber}.`)
					totalSavedIDs.push(...batchIDs)

                    if (!isLastBatch) { // No need to sleep after the very last batch
                        console.log(`Pausing for 500ms before next batch...`)
                        await sleep(500) // Wait for 500 milliseconds
                    }

					if (isLastBatch) {
						console.log("All forms have been saved successfully.", totalSavedIDs)
					}
                }

				console.log(`${totalSavedIDs.length} form(s) saved.`)
            } catch (error) { 
				onSubmitError(error, 'save AI form(s)') 
			} finally {
				if (totalSavedIDs.length > 0) {	
					const finalFilteredChanges = qaForms.formChanges.filter(change => totalSavedIDs.includes(change.form_id))
					
					if (finalFilteredChanges) {
						await submitTransactions(finalFilteredChanges).then((successfulAudits) => {
							if (successfulAudits.length === finalFilteredChanges.length) {
								console.log("All edit transactions have been successfully submitted.")
								setQaForms(prevQaForms => ({...prevQaForms, formChanges: []}))
							} else {
								const totalFailedAudits = finalFilteredChanges?.filter((change, ndx) => !successfulAudits.includes(ndx))
								console.warn("Some edit transactions have failed:", totalFailedAudits)
								setQaForms(prevQaForms => ({...prevQaForms, formChanges: totalFailedAudits}))
							}
						})
					}
				}

				setIsSaving(false) // end saving session
				queryClient.invalidateQueries({ queryKey: reportKeys.aiForms(appID, queryParams) }) // invalidate current query to refetch data
			}
		}
	}

	const resetQuery = () => {
		setRI(null)
		setRecordDate(undefined)
		setRecordDateRange([undefined, undefined])
		setQueryParams(null)
		queryClient.resetQueries({ queryKey: ['report', 'aiForms'] }) // reset query cache
	}

	const clearAllEdits = () => setQaForms({ ...qaForms, forms: qaForms.queryCache, formChanges: [] })

	const exit = () => {
        resetSubmission()
        console.log(`Exiting AI ${apps[appID]} QA monitoring form...`)
        resetAIQA(appID) // delete item in localStorage
        window.location.reload() // refresh the page
	}

	const resetSubmission = () => {
		setSubmissionMessage("")
		setSubmitActionMessage("")
		setIsSuccessful(undefined)
		setIsSaving(false)
		setToSubmit(false)
		setSubmitProgress(0)
		setTotalSubmission(0)
	}

	// loading state
	if (!dataLoaded) return <Flex justifyContent='center' alignContent='center'><Loading id="qa-form-loading" loaderText='Loading QA Monitoring...'/></Flex>
	
	console.log("qaForms", qaForms)
	console.log("filteredData", filteredData)
	console.log("formChanges", qaForms.formChanges)

	return (
		<AIFormContext.Provider value={{
			userData,
			methods,
			defaultFields: fields,
			qaForms,
			setDateSetting,
			dateSetting,
			riID,
			setRI,
			recordDate,
			setRecordDate,
			recordDateRange,
			setRecordDateRange,
			queryParams,
			setQueryParams,
			resetQuery,
			clearAllEdits,
			queryStatus,
			filteredData,
			formChanges: qaForms.formChanges,
			filterItems,
			setFilterItems,
			activeForm: getActiveForm(),
			activeFields: getActiveForm()?.fields,
			activeFormRef: getActiveForm()?.formRef,
            formErrors,
			setActiveForm,
			updateActiveForm,
			updateField,
			onSubmitCurrent: saveForm,
			onSubmitAll: saveAllForms,
			toSubmit,
			isSubmitting: isSaving,
			totalSubmission,
			submitActionMessage,
            submitProgress,
			isSuccessful,
			submissionMessage,
			exit,
			cancelSubmission: resetSubmission
			}}
		>
			<form onSubmit={(e) => e.preventDefault()}>
				<FormProvider {...methods}>
					{children}
				</FormProvider>
			</form>
		</AIFormContext.Provider>
	)
}

// Custom hook to use the form context
export const useAIFormContext = () => {
  const context = useContext(AIFormContext)
  if (!context) throw new Error("useAIFormContext must be used within a FormProvider")
  return context
}
