// import { useEffect } from "react"
// import { verifyClaim } from "./lib/verifyClaim" 
import ClaimVerifier from "./components/ClaimVerifier"

function App() {
  // useEffect(() => {
  //   const claim = "Elon musk is a woman."
  //   verifyClaim(claim)
  //     .then((result) => {
  //       console.log("Verification Result:", result)
  //     })
  //     .catch((error) => {
  //       console.error("Error verifying claim:", error)
  //     })
  // }, [])
  return (
    <>
      <ClaimVerifier></ClaimVerifier>
    </>
  )
}
export default App