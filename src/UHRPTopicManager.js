const bsv = require('babbage-bsv')
const pushdrop = require('pushdrop')
/**
 * Responsible for managing the admission of UHRP UTXOs
 */
// Fields Template for Reference
// UHRP and UMP Fields
/*  
  // UMP user
  // const user = [
  //  Buffer.from(CWI_PROTOCOL_ADDRESS, 'utf8'),
  //  Buffer.from(issuanceId, 'hex'), // Issuance txid and output index (faucet)
  //  Buffer.from('01', 'hex'), // current UMP message (1 for new user)
  //  Buffer.from(passwordPresentationPrimary),
  //  Buffer.from(passwordRecoveryPrimary),
  //  Buffer.from(presentationRecoveryPrimary),
  //  Buffer.from(passwordPrimaryPrivileged),
  //  Buffer.from(presentationRecoveryPrivileged),
  //  Buffer.from(presentationHash),
  //  Buffer.from(passwordSalt),
  //  Buffer.from(recoveryHash),
  //  Buffer.from(presentationKeyEncrypted),
  //  Buffer.from(recoveryKeyEncrypted),
  //  Buffer.from(passwordKeyEncrypted)
  //]
  UHRP Advertisment from createUHRPAdvertisment.js
  fields: [
    Buffer.from('1UHRPYnMHPuQ5Tgb3AF8JXqwKkmZVy5hG', 'utf8'),
    Buffer.from(`${preaction.txid}00000000`, 'hex'),
    Buffer.from(address, 'utf8'),
    hash,
    Buffer.from('advertise', 'utf8'),
    Buffer.from(url, 'utf8'),
    Buffer.from('' + expiryTime, 'utf8'),
    Buffer.from('' + contentLength, 'utf8')
  ]   
*/

class UHRPTopicManager {
  /**
   * Returns the outputs from the UHRP transaction that are admissible.
   * @param {Object} obj all params given in an object
   * *** NOT REQUIRED? @param {Array} [obj.previousUTXOs] - No token update currently necessary ***
   * @param {Object} obj.parsedTransaction transaction containing outputs to admit into the current topic
   * @returns
   */
  identifyAdmissibleOutputs ({ parsedTransaction }) {
    try {
      const outputs = []

      // Validate params
      if (!Array.isArray(parsedTransaction.outputs) || parsedTransaction.outputs.length < 1) {
        const e = new Error('Transaction outputs must be included as an array!')
        e.code = 'ERR_TX_OUTPUTS_REQUIRED'
        throw e
      }
      if (!Array.isArray(parsedTransaction.inputs) || parsedTransaction.inputs.length < 1) {
        const e = new Error('An array of transaction inputs is required!')
        e.code = 'ERR_TX_INPUTS_REQUIRED'
        throw e
      }

      // Try to decode and validate transaction outputs
      for (const [i, output] of parsedTransaction.outputs.entries()) {
        // Decode the UHRP account fields
        try {
          const result = pushdrop.decode({
            script: output.script.toHex(),
            fieldFormat: 'buffer'
          })

          UHRP_PROTOCOL_ADDRESS = '1UHRPYnMHPuQ5Tgb3AF8JXqwKkmZVy5hG'
          if (result.fields[0].toString() !== UHRP_PROTOCOL_ADDRESS) {
            const e = new Error('This transaction is not a valid UHRP advertisement!')
            e.code = 'ERR_UNDEFINED_OUT'
            throw e
          }

          // Validate the previousTXID is correct
          const previousOutpoint = result.fields[1].toString('hex')
          const previousTXID = previousOutpoint.slice(0, 64)
          const previousVout = parseInt(previousOutpoint.slice(64), 16)
          if (previousTXID !== previousUTXO[0].txid || previousVout !== previousUTXO[0].vout) {
            const e = new Error('Transaction does not spend some issuance output')
            e.code = 'ERR_INVALID_TX'
            throw e
          }

          // Use ECDSA to verify signature
          const hasValidSignature = bsv.crypto.ECDSA.verify(
            bsv.crypto.Hash.sha256(Buffer.concat(result.fields)),
            bsv.crypto.Signature.fromString(result.signature),
            bsv.PublicKey.fromString(result.lockingPublicKey)
          )
          if (!hasValidSignature) {
            throw new Error('Invalid Signature')
          }
          outputs.push(i)

        } catch (error) {
          // Probably not a PushDrop token so do nothing
        }
      }
      if (outputs.length === 0) {
        throw new Error(
          'This transaction does not publish a valid UHRP Avertisment descriptor!'
        )
      }

      // Returns an array of output numbers
      return outputs
    } catch (error) {
      return []
    }
  }
}
module.exports = UHRPTopicManager
