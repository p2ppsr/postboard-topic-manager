const bsv = require('babbage-bsv')
const pushdrop = require('pushdrop')
/**
 * Responsible for managing the admission of UMP UTXOs
 */
// Fields Template for Reference
// // UMP Account Fields
// Buffer.from(CWI_PROTOCOL_ADDRESS, 'utf8'),
// Buffer.from(issuanceId, 'hex'), // Issuance txid and output index (faucet)
// Buffer.from('01', 'hex'), // current UMP message (1 for new user) renditionId>
// Buffer.from(passwordPresentationPrimary),
// Buffer.from(passwordRecoveryPrimary),
// Buffer.from(presentationRecoveryPrimary),
// Buffer.from(passwordPrimaryPrivileged),
// Buffer.from(presentationRecoveryPrivileged),
// Buffer.from(presentationHash),
// Buffer.from(passwordSalt),
// Buffer.from(recoveryHash),
// Buffer.from(presentationKeyEncrypted),
// Buffer.from(recoveryKeyEncrypted),
// Buffer.from(passwordKeyEncrypted)

class UMPManager {
  /**
   * Returns the outputs from the UMP transaction that are admissible.
   * @param {Object} obj all params given in an object
   * @param {Array} [obj.previousUTXOs] UTXOs belonging to the current topic being spent as input in the transaction
   * @param {Object} obj.parsedTransaction transaction containing outputs to admit into the current topic
   * @returns
   */
  identifyAdmissibleOutputs ({ previousUTXOs, parsedTransaction }) {
    try {
      const outputs = []

      // Validate params
      if (!Array.isArray(parsedTransaction.outputs) || parsedTransaction.outputs.length < 1) {
        const e = new Error('Transaction outputs must be included as an array!')
        e.code = 'ERR_TX_OUTPUTS_REQUIRED'
        throw e
      }
      if (!Array.isArray(parsedTransaction.inputs) || parsedTransaction.inputs.length < 1) {
        const e = new Error('An array of transaction inputs is required!') // TODO Update error format
        e.code = 'ERR_TX_INPUTS_REQUIRED'
        throw e
      }

      // Try to decode and validate transaction outputs
      for (const [i, output] of parsedTransaction.outputs.entries()) {
        // Decode the UMP account fields
        try {
          const result = pushdrop.decode({
            script: output.script.toHex(),
            fieldFormat: 'buffer'
          })

          if (result.fields[0].toString() === '14HpZFLijstRS8H1P7b6NdMeCyH6HjeBXF') {
          // Check if this is an update, or a new UMP token
            if (result.fields[2].toString('hex') !== '01') {
              const [previousUTXO] = previousUTXOs.filter(x => x.txid === output.prevTxid)
              if (!previousUTXO) {
                const e = new Error('Could not find UMP token to update!')
                e.code = 'ERR_TOKEN_NOT_FOUND'
                throw e
              }
              // Validate the previousTXID is correct
              const previousOutpoint = result.fields[1].toString('hex')
              const previousTXID = previousOutpoint.slice(0, 64)
              const previousVout = parseInt(previousOutpoint.slice(64), 16)
              if (previousTXID !== previousUTXO[0].txid || previousVout !== previousUTXO[0].vout) {
                const e = new Error('Transaction does not spend some issuance output') // ?
                e.code = 'ERR_INVALID_TX'
                throw e
              }
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
          }
        } catch (error) {
          // Probably not a PushDrop token
          console.error(error)
        }
      }
      if (outputs.length === 0) {
        throw new Error(
          'This transaction does not publish a valid CWI account descriptor!'
        )
      }

      // Returns an array of output numbers
      return outputs
    } catch (error) {
      return []
    }
  }
}
module.exports = UMPManager
