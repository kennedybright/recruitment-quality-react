import { CMRSummaryDates } from "../../../lib/types/reports.types"

// Get and format all deviations in a given call
export function getDeviations(fields: string[], form: any): number[] {
    const deviations: number[] = []
    Object.entries(form).forEach(([key, value]) => { // gather all observed differences of the call
        if (fields.includes(key) && value === -1) {
            const deviationDiff = fields.indexOf(key)+1
            deviations.push(deviationDiff) // append deviated question number
        }
    })
    return deviations
}

// Get and format all MCA dates deviation data in given calls
export function getAllCMRSummaryDates(forms: any[]): CMRSummaryDates {
    let mcaDatesData = {
        address: new Set<string>,
        delayed_coding: new Set<string>,
        persuading: new Set<string>,
        incorrect_disposition: new Set<string>,
        verbatim_break: new Set<string>,
        inaccurate_data: new Set<string>,
        improper_intro: new Set<string>,
        mandatory_text: new Set<string>,
        leading_bias: new Set<string>,
    }

    forms?.sort((a, b) => a.record_number - b.record_number).forEach((form) => {
        // append record date to corresponding deviation
        if (form.mailing_address === -1 || form.home_address === -1) mcaDatesData.address.add(form.record_date)
        if (form.coding === -1) mcaDatesData.delayed_coding.add(form.record_date)
        if (form.overcoming_objections === -1) mcaDatesData.persuading.add(form.record_date)
        if (form.disposition === "INCORRECT") mcaDatesData.incorrect_disposition.add(form.record_date)

        // append record date to corresponding mca
        if (form.verbatim_break === true) mcaDatesData.verbatim_break.add(form.record_date)
        if (form.inaccurate_data === true) mcaDatesData.inaccurate_data.add(form.record_date)
        if (form.improper_intro === true) mcaDatesData.improper_intro.add(form.record_date)
        if (form.mandatory_text === true) mcaDatesData.mandatory_text.add(form.record_date)
        if (form.leading_bias === true) mcaDatesData.leading_bias.add(form.record_date)
    })

    return {
        address: [...mcaDatesData.address],
        delayed_coding: [...mcaDatesData.delayed_coding],
        persuading: [...mcaDatesData.persuading],
        incorrect_disposition:[...mcaDatesData.incorrect_disposition],
        verbatim_break: [...mcaDatesData.verbatim_break],
        inaccurate_data: [...mcaDatesData.inaccurate_data],
        improper_intro: [...mcaDatesData.improper_intro],
        mandatory_text: [...mcaDatesData.mandatory_text],
        leading_bias: [...mcaDatesData.leading_bias],
    }
}