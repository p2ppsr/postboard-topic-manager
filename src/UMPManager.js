/**
 * Responsible for managing the admission of UMP UTXOs
 */
class UMPManager {
  /**
   * Returns the outputs from the UMP transaction that are admissible.
   * @param {Object} obj all params given in an object
   * @param {Array} [obj.previousUTXOs] UTXOs belonging to the current topic being spent as input in the transaction
   * @param {Object} obj.parsedTransaction transaction containing outputs to admit into the current topic 
   * @returns 
   */
  identifyAdmissibleOutputs ({ previousUTXOs, parsedTransaction }) {
    const outputs = []

    if (previousUTXOs) {
      // existing UTXOs that should be updated / deleted
    }

    for (const output of parsedTransaction.outputs){
      // Decode the UMP account fields
      const result = pushdrop.decode({
        script: output.outputScript,
        fieldFormat: 'buffer'
      })

      // UMP Account Fields (Why should these be decoded here if they are not returned to be stored in the db?)
      const cwiProtocolAddress = result[0]
      const issuanceId = result[1]
      const currentUMPMessage = result[2]
      const passwordPresentationPrimary = result[3]
      const passwordRecoveryPrimary = result[4]
      const presentationRecoveryPrimary = result[5]
      const passwordPrimaryPrivileged = result[6]
      const presentationHash = result[7]
      const passwordSalt = result[8]
      const recoveryHash = result[9]
      const presentationKeyEncrypted = result[10]
      const recoveryKeyEncrypted = result[11]
      const recoverpasswordKeyEncryptedyHash = result[12]

      // TODO: Validate fields
    }

    // if (!Array.isArray(parsedTransaction.out) || parsedTransaction.out.length < 1) {
    //   throw new Error('Transaction outputs must be included as an array!')
    // }
    // if (!Array.isArray(parsedTransaction.in) || parsedTransaction.in.length < 1) {
    //   throw new Error('An array of transaction inputs is required!')
    // }

    // // Get a CWI account descriptor
    // const OP_CHECKSIG = 172
    // const out = parsedTransaction.out.filter(x =>
    //   x.b1 && x.b1.op === OP_CHECKSIG &&
    //   x.s2 === '14HpZFLijstRS8H1P7b6NdMeCyH6HjeBXF' &&
    //   x.s16 !== undefined
    // )[0]
    // if (!out) {
    //   throw new Error(
    //     'This transaction does not publish a valid CWI account descriptor!'
    //   )
    // }

    // const previousOutpoint = out.h3
    // const previousTXID = previousOutpoint.slice(0, 64)
    // const previousVout = parseInt(previousOutpoint.slice(64), 16)
    // if (!action.in.some(x =>
    //   x.e.h === previousTXID && x.e.i === previousVout
    // )) {
    //   throw new Error('Transaction does not spend some issuance output')
    // }

    // Use ECDSA to verify signature (NOTE: Is this optimal? Similar code but different implementation in CoolCert)
    // const contains_char = (string, char) => (string.indexOf(char) > -1)
    // let fields = Object.entries(out)
    //   .filter(([key, _]) => (
    //     contains_char(key, 'b') &&
    //     Number(key.slice(1)) >= 2 &&
    //     Number(key.slice(1)) < 16)
    //   )
    //   .map(([_, value]) =>
    //     (value.op)
    //       ? Buffer.from((value.op-80).toString(16).padStart(2, '0'), 'hex')
    //       : Buffer.from(value, 'base64')
    //   )
    // const has_valid_signature = bsv.crypto.ECDSA.verify(
    //   bsv.crypto.Hash.sha256(Buffer.concat(fields)),
    //   bsv.crypto.Signature.fromString(out.h16),
    //   bsv.PublicKey.fromString(out.h0)
    // )
    // if (!has_valid_signature) {
    //   throw new Error('Invalid Signature')
    // }

    // let currentOutpoint = parsedTransaction.tx.h+Number(out.i).toString(16).padStart(8, '0')
    // const new_account_record = {
    //   currentRendition:               out.b4.op - 80,   // Rendition ID (starts at 1, increments by 1 with every update)
    //   passwordPresentationPrimary:    out.b5,           // Primary Key encrypted with the XOR of the password key and the presentation key
    //   passwordRecoveryPrimary:        out.b6,           // Primary Key encrypted with the XOR of the password key and the recovery key
    //   presentationRecoveryPrimary:    out.b7,           // Primary Key encrypted with the XOR of the presentation key and the recovery key
    //   passwordPrimaryPrivileged:      out.b8,           // Privileged Key encrypted with the XOR of the password key and the primary key
    //   presentationRecoveryPrivileged: out.b9,           // Privileged Key encrypted with the XOR of the presentation key and the recovery key
    //   presentationHash:               out.b10,          // The SHA-256 hash of the current presentation key
    //   passwordSalt:                   out.b11,          // 32-byte password salt for use in PBKDF2
    //   recoveryHash:                   out.b12,          // The SHA-256 hash of the current recovery key
    //   presentationKeyEncrypted:       out.b13,          // Current presentation key encrypted with the Privileged Key
    //   recoveryKeyEncrypted:           out.b14,          // Current recovery key encrypted with the Privileged Key
    //   passwordKeyEncrypted:           out.b15,          // Current password key encrypted with the Privileged Key
    //   signature:                      out.b16,          // A signature from the field 0 public key over fields 2-15
    // }

    // Returns an array of output numbers
    return 0 // vout === ?
  }
}
module.exports = UMPManager
