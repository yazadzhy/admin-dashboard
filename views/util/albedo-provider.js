import albedo from '@albedo-link/intent'
import config, {setGlobalConfigParam} from '../../api/config'

/**
 * Check whether we have alive Albedo session
 * @return {boolean}
 */
export function checkAlbedoSession() {
    return albedo.isImplicitSessionAllowed('sign_message', config.nodePubkey)
}

/**
 * Check whether a user provided Albedo session permissions
 * @return {Promise<Boolean>}
 */
export async function requestAlbedoSession() {
    try {
        const {pubkey} = await albedo.implicitFlow({
            intents: 'sign_message'
        })
        setGlobalConfigParam('nodePubkey', pubkey)
        return true
    } catch (e) {
        notify({type: 'error', message: e.error?.message || 'Failed to obtain session permission'})
        return false
    }
}

/**
 * Sign API request data
 * @param {{}} data - Request data to sign
 * @return {Promise<String>} - Message signature
 */
export async function signData(data) {
    //check whether the session is alive
    if (!checkAlbedoSession()) {
        //try to connect
        await requestAlbedoSession()
        //if connection is unsuccessful, the error will be thrown
    }

    try {
        //try to sign the payload
        const {message_signature} = await albedo.signMessage({
            message: JSON.stringify(data),
            pubkey: config.nodePubkey
        })
        return message_signature
    } catch (e) {
        notify({type: 'error', message: e.error?.message || 'Failed to sign API request'})
        throw e
    }
}