import { FC, useState } from 'react'
import Modal from '@nielsen-media/maf-fc-modal'
import Link from '@nielsen-media/maf-fc-link'
import { aliasTokens, JSONObject } from '@nielsen-media/maf-fc-foundation'
import Flex from '@nielsen-media/maf-fc-flex'
import Text from '@nielsen-media/maf-fc-text'

interface AIScoringAnalysisProps {
    label: string
    analysis?: JSONObject
}

export const AIScoringAnalysis: FC<AIScoringAnalysisProps> = ({ label, analysis }) => {
    const [opened, setOpened] = useState<boolean>()
    const onClose = () => setOpened(false)

    const resultAnalysis = (analysis && Object.keys(analysis).some(key => key.endsWith("-analysis"))) ? Object.entries(analysis).find(([key, value]) => key.includes("-analysis"))[1] || null : null
    const suggestion = (analysis && Object.keys(analysis).some(key => key.endsWith("-suggestion"))) ? Object.entries(analysis).find(([key, value]) => key.includes("-suggestion"))[1] || null : null

    return (
        <>
            <Link fontSize='s500' onClick={() => setOpened(true)}>Review Analysis</Link>
            <Modal
                onClose={onClose}
                opened={opened}
                title={`Call Analysis for ${label}`}
            >
                <Flex column gap={aliasTokens.space500}>
                    {/* Call Analysis */}
                    <Flex column gap={aliasTokens.space300}>
                        <Text fontWeight='bold' fontSize='s400'>AI Agent Analysis:</Text>
                        <Text fontWeight='regular' fontSize='s400'>
                            {resultAnalysis 
                                ? Object.entries(resultAnalysis).map(([key, value]) => {
                                    if (typeof value === "object" && value !== null && !Array.isArray(value)) { // handle nested result analysis
                                        return Object.entries(value).map(([key, value]) => (
                                            <div key={key}>
                                                {`${key}: ${value}`}
                                            </div>
                                        ))
                                    } else {
                                        return (
                                            <div key={key}>
                                                {`${key}: ${value}`}
                                            </div>
                                        )
                                    }
                                })
                                : "No analysis given."
                            }
                        </Text>
                    </Flex>

                    {/* Suggestions */}
                    <Flex column gap={aliasTokens.space300}>
                        <Text fontWeight='bold' fontSize='s400'>The AI Agent suggests...</Text>
                        <Text fontWeight='regular' fontSize='s400'>
                            {(suggestion || (typeof suggestion === 'string' && suggestion.length > 0)) 
                                ? suggestion 
                                : "No suggestions given."
                            }
                        </Text>
                    </Flex>
                </Flex>
            </Modal>
        </>
    )
}