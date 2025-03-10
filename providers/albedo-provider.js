import albedo from '@albedo-link/intent'
import clientStatus from '../state/client-status'

/**
 * Check whether we have alive Albedo session
 * @return {boolean}
 */
export function checkAlbedoSession(pubkey) {
    return albedo.isImplicitSessionAllowed('sign_message', pubkey || clientStatus.clientPublicKey)
}

/**
 * Check whether a user provided Albedo session permissions
 * @return {Promise<string>}
 */
export async function requestAlbedoSession() {
    try {
        const {grants, session, pubkey, valid_until} = await albedo.implicitFlow({
            intents: 'sign_message'
        })
        //save current session
        localStorage.setItem('albedo_session', JSON.stringify({grants, session, pubkey, valid_until}))
        return pubkey
    } catch (e) {
        notify({type: 'error', message: e.error?.message || 'Failed to obtain session permission'})
        return null
    }
}

export async function retrieveAlbedoSession() {
    //check whether the session is saved and valid
    const savedAlbedoSession = JSON.parse(localStorage.getItem('albedo_session'))
    if (savedAlbedoSession?.valid_until > Date.now())
        return savedAlbedoSession.pubkey

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
            pubkey: clientStatus.clientPublicKey
        })
        return message_signature
    } catch (e) {
        notify({type: 'error', message: e.error?.message || 'Failed to sign API request'})
        throw e
    }
}

export function dropSession(authPubkey) {
    //forget session
    if (typeof authPubkey === 'string') {
        albedo.forgetImplicitSession(authPubkey || clientStatus.clientPublicKey)
    }
    if (clientStatus.clientPublicKey) {
        albedo.forgetImplicitSession(clientStatus.clientPublicKey)
    }
    localStorage.removeItem('albedo_session')
    clientStatus.clientPublicKey = ''
    clientStatus.pollSession()
}

export function signTx(txXdr, pubkey, network, description, submit = false) {
    return albedo.tx({xdr: txXdr, pubkey, network, submit, description})
}