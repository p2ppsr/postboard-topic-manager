const bsv = require('babbage-bsv')
const pushdrop = require('pushdrop')
const { getPaymentAddress } = require('sendover')

/**
 * Responsible for managing the admission of Postboard UTXOs
 */
// Fields Template for Reference
// Postboard Fields
/*  
  fields: [
    Buffer.from('postboard', 'utf8'),
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
          let result
          try {
            result = pushdrop.decode({
              script: output.script.toHex(),
              fieldFormat: 'buffer'
            })
          } catch (e) {
            throw new Error('Not a valid PushDrop token output.')
          }

          if (result.fields[0].toString() !== POSTBOARD_PREFIX) {
            const e = new Error('This transaction is not a valid Postboard token!')
            e.code = 'ERR_UNDEFINED_OUT'
            throw e
          }

          // Ensure identity key is the correct length
          if (result.fields[1].byteLength !== 33) {
            const e = new Error('Identity key must be 33 bytes')
            e.code = 'ERR_INVALID_IDENTITY_KEY_LENGTH'
            throw e
          }

          // Ensure result.lockingPublicKey came from result.fields[1]
          const expected = getPaymentAddress({
            senderPrivateKey: '0000000000000000000000000000000000000000000000000000000000000001',
            recipientPublicKey: result.fields[1].toString('hex'),
            invoiceNumber: '2-postboard-1',
            returnType: 'publicKey'
          })
          console.log('claimed key', result.fields[1].toString('hex'))
          console.log('expected child', expected)
          console.log('actual child', result.lockingPublicKey)
          if (expected !== result.lockingPublicKey) {
            const e = new Error('Unable to verify identity public key links to signing key')
            e.code = 'ERR_IDENTITY_NOT_LINKED'
            throw e
          }

          // Ensure post is at least 2 characters
          if (result.fields[2].toString('utf8').length <= 2) {
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

          console.log(`Admitting Postboard output #${i} as valid`)
          outputs.push(i)

        } catch (error) {
          // Probably not a PushDrop token so do nothing
          console.error(`Error with output #${i}:`)
          console.log(error)
        }
      }
      // Returns an array of output numbers
      console.log('Outputs to admit:', )
      return outputs
    } catch (error) {
      return []
    }
  }
}
module.exports = PostboardTopicManager
