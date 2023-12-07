import React, {useCallback, useState} from 'react'
import {AccountAddress, CopyToClipboard} from '@stellar-expert/ui-framework'
import ActionFormLayout, {updateTimeValidation} from './action-form-layout'
import ActionNodeLayout from './action-node-layout'
import AddNodeEntry from './add-node-entry-form'

export default function UpdateNodeView({settings}) {
    const [isValid, setIsValid] = useState(false)
    const [changedSettings, setChangedSettings] = useState(structuredClone(settings))
    const [isLimitUpdates, setIsLimitUpdates] = useState(false)

    const validation = useCallback(newSettings => {
        if (!updateTimeValidation(newSettings))
            return setIsValid(false)
        setIsValid(true)
    }, [])

    const saveNode = useCallback((node) => {
        const index = changedSettings.config.nodes.findIndex(n => n.pubkey === node.pubkey)
        setChangedSettings(prev => {
            const newSettings = {...prev}
            if (index !== -1) {
                newSettings.config.nodes[index] = node
            } else {
                newSettings.config.nodes.push(node)
            }
            newSettings.config.nodes = newSettings.config.nodes.filter(n => !n.remove)
            validation(newSettings)
            return newSettings
        })
        setIsLimitUpdates(true)
    }, [changedSettings, validation])

    return <ActionNodeLayout settings={changedSettings} currentConfig={settings} isValid={isValid}>
        <h3>Peer nodes</h3>
        <hr className="flare"/>
        <ActionFormLayout updateSettings={setChangedSettings} validation={validation}>
            <h3>Quorum nodes</h3>
            {changedSettings.config.nodes?.map(node => !node.remove &&
                <NodeEntryLayout key={node.pubkey} node={node} save={saveNode} isLimitUpdates={isLimitUpdates}/>)}
            <div className="space"/>
            {!isLimitUpdates && <AddNodeEntry title={<><i className="icon-plus"/>Add new node</>} save={saveNode}/>}
        </ActionFormLayout>
    </ActionNodeLayout>
}

function NodeEntryLayout({node, save, isLimitUpdates}) {
    const [isEditFormOpen, setIsEditFormOpen] = useState(false)

    const toggleShowForm = useCallback(() => setIsEditFormOpen(isOpen => !isOpen), [])

    const removeNode = useCallback(() => {
        const confirmation = `Do you really want to remove this node?`
        if (confirm(confirmation)) {
            save({
                ...node,
                remove: true
            })
        }
    }, [node, save])

    const onSave = useCallback(node => {
        setIsEditFormOpen(false)
        save(node)
    }, [save])

    return <>
        <div className="dual-layout space">
            <div className="v-center-block">
                <span><i className="icon-hexagon-dice color-success"/><AccountAddress account={node.pubkey} chars={16} link={false}/></span>
                <span className="dimmed text-small">&emsp;&emsp;{node.url}</span>
            </div>
            <div style={{marginRight: 'auto'}}>
                <CopyToClipboard text={node.pubkey} title="Copy public key to clipboard"/>
                {!isLimitUpdates && <a href="#" className="icon-cog" onClick={toggleShowForm}/>}
                {!isLimitUpdates && <a href="#" className="icon-cancel" onClick={removeNode}/>}
            </div>
        </div>
        {!isLimitUpdates && <AddNodeEntry editNode={node} isEditFormOpen={isEditFormOpen} save={onSave}/>}
    </>
}