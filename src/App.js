import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'
import './global.css'
const BN = require("bn.js");

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {

  

  

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(false)

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false)

  const [tokenData, setTokenData] = React.useState([])

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js
        window.contract.nft_tokens_for_owner({ account_id: window.accountId })
          .then(response => {
       
            setTokenData(...response)

            if(response.length >0){
  
              setShowNotification(true)
            }
            
          })
      }
    },

   
    []
  )



  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main >
        <h1>Hello There!</h1>
       <p style={{ textAlign: 'center' }}>Encourage a friend quit smoking today</p>
        <p style={{ textAlign: 'center', marginTop: '3em' }}>
          <a className="neon-button" onClick={login}>Sign in</a>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <a style={{ float: 'right' }} onClick={logout}>
        Sign out
      </a>
      <main>
      <p style={{ textAlign: 'center' }}>Cigarette smoking remains the leading cause of preventable disease, 
      disability, and death accross the glob, accounting for more than 480,000 deaths every year, or about 1 in 5 deaths in united states alone.</p>

       <h5 style={{ textAlign: 'center' }}>You can support a friend quit smoking by sending them an NFT as a token of encouragement</h5>
        <div >
          <img className="img" src="https://bafkreidkn7u6fckrrqs4vqhodbcpldul5tef22dro7jk5suzcri3x5hdlu.ipfs.nftstorage.link/" width="550" height="400" />
        </div>
        <form onSubmit={async event => {
          event.preventDefault()

          // get elements from the form using their id attribute
          const { fieldset, owner } = event.target.elements
         
          // disable the form while the value gets updated on-chain
          fieldset.disabled = true

          try {
            // make an update call to the smart contract
            const supply_count = await window.contract.nft_total_supply()
            console.log("test"+JSON.stringify(supply_count))
            const media = "https://bafkreidkn7u6fckrrqs4vqhodbcpldul5tef22dro7jk5suzcri3x5hdlu.ipfs.nftstorage.link/";
            await window.contract.nft_mint({

              
                token_id: `#${supply_count}-quit-smoking`,
                 token_owner_id: owner.value.trim().length !== 0 ? owner.value : window.accountId ,
                token_metadata: {
                  title: `Tar the roads, not your lungs #${supply_count}`,
                  description: "Put it out before it puts you out",
                  media: media,
                },
               
              },
              300000000000000, // attached GAS (optional)
              new BN("1000000000000000000000000")

            )

          } catch (e) {
            alert(
              'Something went wrong! ' +
              'Maybe you need to sign out and back in? ' +
              'Check your browser console for more info.'
            )
            throw e
          } finally {
            // re-enable the form, whether the call succeeded or failed
            fieldset.disabled = false
          }

         
         

          // remove Notification again after css animation completes
          // this allows it to be shown again next time the form is submitted
          setTimeout(() => {
            setShowNotification(false)
          }, 11000)
        }}>
          <fieldset id="fieldset">

          

           { !showNotification && <p
              style={{ display: 'flex', alignContent: 'center', justifyContent:'center' }}
            >
             Click "Mint" below to mint your NFT 
            </p> }
          
            
            <p >if left empty nft will be send to the minter account 
                </p>
            <div style={{ display: 'flex', alignContent: 'center', justifyContent:'center' }}>
              
              <input
                autoComplete="off"
                //defaultValue={greeting}
                placeholder = "Enter recipient NEAR ID eg: near.testnet "
                id="owner"
                
                style={{ flex: 1 }}
              />
              <button className="neon-button"
                disabled={buttonDisabled}
                
                
              >
                MINT
              </button>
            </div>
          </fieldset>
        </form>
       
      </main>
      {showNotification && <Notification />}
    </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <div>
      <p style={{ textAlign: "center" }}>
                Awesome you have an NFT! Now Click   {" "}
                <a href={"https://wallet.testnet.near.org/?tab=collectibles"}>
                here
                </a>
                {" "}to see your NFT or mint for another friend:)
      </p>
      
    </div>
  )
}
