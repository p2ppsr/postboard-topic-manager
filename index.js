/**
 * Responsible for managing the admission of UMP UTXOs
 */
class UMPManager {
  // Returns the outputs from the UMP transaction that are admissible.
  findAdmissableOutputs ({ previousUTXOs, parsedTransaction }) {
    const outputs = []

    // TODO: Move over logic from the UMP bridge transformer ----------
    // const new_account_record = {
      // currentRendition:               out.b4.op - 80,   // Rendition ID (starts at 1, increments by 1 with every update)
      // passwordPresentationPrimary:    out.b5,           // Primary Key encrypted with the XOR of the password key and the presentation key
      // passwordRecoveryPrimary:        out.b6,           // Primary Key encrypted with the XOR of the password key and the recovery key
      // presentationRecoveryPrimary:    out.b7,           // Primary Key encrypted with the XOR of the presentation key and the recovery key
      // passwordPrimaryPrivileged:      out.b8,           // Privileged Key encrypted with the XOR of the password key and the primary key
      // presentationRecoveryPrivileged: out.b9,           // Privileged Key encrypted with the XOR of the presentation key and the recovery key
      // presentationHash:               out.b10,          // The SHA-256 hash of the current presentation key
      // passwordSalt:                   out.b11,          // 32-byte password salt for use in PBKDF2
      // recoveryHash:                   out.b12,          // The SHA-256 hash of the current recovery key
      // presentationKeyEncrypted:       out.b13,          // Current presentation key encrypted with the Privileged Key
      // recoveryKeyEncrypted:           out.b14,          // Current recovery key encrypted with the Privileged Key
      // passwordKeyEncrypted:           out.b15,          // Current password key encrypted with the Privileged Key
      // signature:                      out.b16,          // A signature from the field 0 public key over fields 2-15
    // }

    for (const output of previousUTXOs) {
      // TODO: Add Validation
      outputs.push(output.vout)
    }
    // Returns an array of output numbers
    return outputs
  }
}
module.exports = UMPManager
