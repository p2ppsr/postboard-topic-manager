const bsv = require('babbage-bsv')
const pushdrop = require('pushdrop')
/**
 * Responsible for managing the admission of Postboard UTXOs
 */
// Fields Template for Reference
// Postboard Fields
/*  
  fields: [
    Buffer.from('postboard', 'utf8'),
    identityKey,
    message,
  ]
*/

const POSTBOARD_PREFIX = 'postboard'

class PostboardTopicManager {
  /**
   * Returns the outputs from the Postboard transaction that are admissible.
   * @param {Object} obj all params given in an object
   * @param {Object} obj.parsedTransaction transaction containing outputs to admit into the current topic
   * @returns
   */
  identifyAdmissibleOutputs ({ parsedTransaction }) {
    try {
      const outputs = []

      // Validate params
      if (!Array.isArray(parsedTransaction.inputs) || parsedTransaction.inputs.length < 1) {
        const e = new Error('An array of transaction inputs is required!')
        e.code = 'ERR_TX_INPUTS_REQUIRED'
        throw e
      }
      if (!Array.isArray(parsedTransaction.outputs) || parsedTransaction.outputs.length < 1) {
        const e = new Error('Transaction outputs must be included as an array!')
        e.code = 'ERR_TX_OUTPUTS_REQUIRED'
        throw e
      }

      // Try to decode and validate transaction outputs
      for (const [i, output] of parsedTransaction.outputs.entries()) {
        // Decode the postboard token fields
        try {
          const result = pushdrop.decode({
            script: output.script.toHex(),
            fieldFormat: 'buffer'
          })

          if (result.fields[0].toString() !== POSTBOARD_PREFIX) {
            const e = new Error('This transaction is not a valid Postboard token!')
            e.code = 'ERR_UNDEFINED_OUT'
            throw e
          }

          // Field must be a valid user identity key
          const identityKeyBuf = Buffer.from(result.fields[1], 'hex')
          if (identityKeyBuf.byteLength !== 33) {
            const e = new Error(`Invalid identity key length, must be a 33-byte DER-encoded public key X coordinate, but this value is ${identityKeyBuf.byteLength} bytes.`)
            e.code = 'ERR_INVALID_IDENTITY_KEY'
            throw e
          }

          if (result.fields[2].toString('utf8').length > 2) {
            const e = new Error('Postborad messages must be at least 2 characters')
            e.code = 'ERR_INVALID_MESSAGE_LENGTH'
            throw e
          }

          // Use ECDSA to verify signature
          const hasValidSignature = bsv.crypto.ECDSA.verify(
            bsv.crypto.Hash.sha256(Buffer.concat(result.fields)),
            bsv.crypto.Signature.fromString(result.signature),
            bsv.PublicKey.fromString(result.lockingPublicKey)
          )
          if (!hasValidSignature) {
            const e = new Error('Invalid Signature')
            e.code = 'ERR_INVALID_SIGNATURE'
            throw e
          }

          // TODO: Ensure the ownerKey is derived from the field 1 identityKey

          outputs.push(i)

        } catch (error) {
          // Probably not a PushDrop token so do nothing
          console.log(error)
        }
      }
      // Returns an array of output numbers
      return outputs
    } catch (error) {
      return []
    }
  }
}
module.exports = PostboardTopicManager
