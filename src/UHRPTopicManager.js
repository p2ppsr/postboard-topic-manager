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
    Buffer.from(`${preaction.txid}00000000`, 'hex'), <----- GONE!
    Buffer.from(address, 'utf8'),
    hash,
    Buffer.from('advertise', 'utf8'),
    Buffer.from(url, 'utf8'),
    Buffer.from('' + expiryTime, 'utf8'),
    Buffer.from('' + contentLength, 'utf8')
  ]   
*/

const UHRP_PROTOCOL_ADDRESS = '1UHRPYnMHPuQ5Tgb3AF8JXqwKkmZVy5hG'

class UHRPTopicManager {
  /**
   * Returns the outputs from the UHRP transaction that are admissible.
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

      // let previousTXIDORVoutExists = false
      // for (const [i, input] of parsedTransaction.input.entries()) {
      //   // Decode the UHRP Advertisment input fields
      //   try {
      //     const result = pushdrop.decode({
      //       script: input.script.toHex(),
      //       fieldFormat: 'buffer'
      //     })

          // Note: field indexes may not be correct and should be validated with the pushdrop.create side!

          // TODO: Add validation that matches the relevent checks from the uhrp bridge transformer
          // Existing code to reference: 

          // Field must be a valid SHA256 hex (all content hashes are SHA256 hashes)
          // const hashBuf = Buffer.from(out.h5, 'hex')
          // if (hashBuf.byteLength !== 32) {
          //   const e = new Error(`Invalid hash length, must be 32 bytes but this value is ${hashBuf.byteLength}`)
          //   e.code = 'ERR_INVALID_LENGTH_HASH'
          //   throw e
          // }

          // if (out.s6 !== 'advertise') {
          //   const e = new Error('Only advertise is supported (for now), revoke will be added later by spending the PushDrop token and maybe timestamps could be removed')
          //   e.code = 'ERR_INVALID_SUPPORT_ONLY_ADVERTISE'
          //   throw e
          // }

          // // The URL must start with "https://"
          // if (!out.s7.startsWith('https://')) {
          //   const e = new Error('URL does not start with "https://"')
          //   e.code = 'ERR_INVALID_HTTP_PREFIX_URL'
          //   throw e
          // }

          // // The URL must contain a "."
          // if (out.s7.indexOf('.') === -1) {
          //   const e = new Error('URL does not contain a dot')
          //   e.code = 'ERR_INVALID_HTTP_DOT_URL'
          //   throw e
          // }

          // // The URL must not contain a " "
          // if (out.s7.indexOf(' ') !== -1) {
          //   const e = new Error('URL contains a space')
          //   e.code = 'ERR_INVALID_HTTP_SPACE_URL'
          //   throw e
          // }

          // // The timestamp must be an integer
          // if (!Number.isInteger(Number(out.s8))) {
          //   const e = new Error('Timestamp must be an integer')
          //   e.code = 'ERR_TYPE_NOT_INT_TIMESTAMP'
          //   throw e
          // }

          // // Timestamp must be greater than 1600000000
          // if (Number(out.s8) < 1600000000) {
          //   const e = new Error('Timestamp is too small')
          //   e.code = 'ERR_INVALID_SIZE_TOO_SMALL_TIMESTAMP'
          //   throw e
          // }

          // // Timestamp must be less than 100000000000
          // if (Number(out.s8) > 100000000000) {
          //   const e = new Error('Timestamp is too large')
          //   e.code = 'ERR_INVALID_SIZE_TOO_BIG_TIMESTAMP'
          //   throw e
          // }

          // // Content length  must be an integer
          // if (!Number.isInteger(Number(out.s9))) {
          //   const e = new Error('Content length must be an integer')
          //   e.code = 'ERR_TYPE_NOT_INT_CONTENT_LENGTH'
          //   throw e
          // }

          // // Content length must be greater than 0
          // if (Number(out.s9) <= 0) {
          //   const e = new Error(`Content length must be a positive value: ${out.s9}`)
          //   e.code = 'ERR_INVALID_LENGTH_TOO_SMALL_CONTENT_LENGTH'
          //   throw e
          // }

          // // Current architecture should support up to about 11 gigabyte files
          // // The bottleneck is in server-side hash calculation (the notifier.)
          // // The notifier times out after 540 seconds, and hashing takes time.
          // // If this changes, the limit should be re-evaluated.
          // // Content length  must be less than 100000000000
          // if (Number(out.s9) > 11000000000) {
          //   const e = new Error(`Currently, the maximum supported file size is 11000000000 bytes:${out.s9}. Larger files will be supported in future versions, but consider breaking your file into chunks. Email nanostore-limits@babbage.systems if this causes you pain.`)
          //   e.code = 'ERR_INVALID_LENGTH_TOO_BIG_CONTENT_LENGTH'
          //   throw e
          // }

          // NOT NEEDED (TODO: DELETE)
          // Validate that either previousTXID or previousVout exist
          // const previousOutpoint = result.fields[1].toString('hex')
          // const previousTXID = previousOutpoint.slice(0, 64)
          // const previousVout = parseInt(previousOutpoint.slice(64), 16)

      //     previousTXIDORVoutExists = previousTXID !== undefined || previousVout !== undefined
      //     if (previousTXIDORVoutExists) break
            
      //   } catch (error) {
      //     // Probably not a PushDrop token so do nothing
      //   }
      // }
      // if (!previousTXIDORVoutExists) {
      //   const e = new Error('UHRP Advertisment transaction does not have valid inputs')
      //   e.code = 'ERR_INVALID_TX_INPUT'
      //   throw e
      // }
       
      // Try to decode and validate transaction outputs
      for (const [i, output] of parsedTransaction.outputs.entries()) {
        // Decode the UHRP account fields
        try {
          const result = pushdrop.decode({
            script: output.script.toHex(),
            fieldFormat: 'buffer'
          })

          if (result.fields[0].toString() !== UHRP_PROTOCOL_ADDRESS) {
            const e = new Error('This transaction is not a valid UHRP advertisment!')
            e.code = 'ERR_UNDEFINED_OUT'
            throw e
          }

          // Validate the previousTXID is correct
          // const previousOutpoint = result.fields[1].toString('hex')
          // const previousTXID = previousOutpoint.slice(0, 64)
          // const previousVout = parseInt(previousOutpoint.slice(64), 16)
          // if (previousTXID !== previousUTXO[0].txid || previousVout !== previousUTXO[0].vout) {
          //   const e = new Error('Transaction does not spend some issuance output')
          //   e.code = 'ERR_INVALID_TX_OUTPUT'
          //   throw e
          // }



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
