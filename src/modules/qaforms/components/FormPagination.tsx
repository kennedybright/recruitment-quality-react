import { FC, useEffect, useState } from "react"
import { FlexWrapper350 } from "../../../lib/shared.styles"
import { StyledPagination } from "../styles"
import { useFormContext } from "../base/form.context"
import { FormMode } from "../../../lib/types/forms.types"
import { useAIFormContext } from "../base/formAI.context"

interface FormPaginationProps {
    mode: FormMode
}

export const FormPagination: FC<FormPaginationProps> = ({ mode }) => {
    const ref = () => {
        switch(mode) {
            case 'new': {
                const { qaForms, setActiveForm } = useFormContext()
                
                return {
                    forms: qaForms,
                    setActive: setActiveForm
                }
            }

            case 'ai': {
                const { qaForms, setActiveForm } = useAIFormContext()
                
                return {
                    forms: qaForms,
                    setActive: setActiveForm
                }
            }
        }
    }
    const qaForms = ref().forms
    const setActiveForm = ref().setActive
    const [currentPage, setCurrentPage] = useState<number>(0)

    useEffect(() => { // set Current Page when the active form changes
        const pageNdx = qaForms.forms.findIndex(form => form.formID === qaForms.activeFormID)
        if (pageNdx !== -1 && pageNdx != currentPage) setCurrentPage(pageNdx)
    }, [qaForms.activeFormID])
    
    return (
        <FlexWrapper350 className="form-pages">
            <StyledPagination
                aria-label="forms-navigation"
                currentPage={currentPage}
                totalItems={qaForms.forms.length}
                pageSize={1}
                onChange={({ event, currentPage }) => {
                    setCurrentPage(currentPage)
                    const newFormID = qaForms.forms[currentPage]?.formID
                    if (newFormID) setActiveForm(newFormID)
                }}
            />
        </FlexWrapper350>
    )
}