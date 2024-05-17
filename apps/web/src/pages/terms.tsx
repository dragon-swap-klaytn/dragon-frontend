/* eslint-disable react/no-unescaped-entities */
import styled from 'styled-components'
import { CHAIN_IDS } from 'utils/wagmi'

const StyledLayer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 60px;
`

const StyledTextBox = styled.div`
  max-width: 860px;
`

const StyledB = styled.div`
  font-weight: bold;
  font-size: 18px;
  margin-top: 48px;
`

const StyledP = styled.p`
  margin-top: 18px;
`

const StyledUl = styled.ul`
  margin-top: 16px;

  li {
    margin-top: 8px;
  }
`

const TermsPage = () => {
  return (
    <StyledLayer>
      <StyledTextBox>
        <b style={{ fontSize: '24px' }}>DragonSwap Terms of Service</b>
        <StyledP>
          <i>Last modified: May 07, 2024</i>
        </StyledP>
        <StyledP>
          These Terms of Service (the “Agreement”) explains the terms and conditions by which you may access and use
          https://dgswap.io/ and any subdomains associated with the Website. You must read this Agreement carefully as
          it governs your use of the Website. By accessing or using the Website, you signify that you have read,
          understand, and agree to be bound by this Agreement in its entirety. If you do not agree, you are not
          authorized to access or use the Website and should not use the Website.
        </StyledP>
        <StyledP>
          NOTICE: This Agreement contains important information, including a binding arbitration provision and a class
          action waiver, both of which impact your rights as to how disputes are resolved. The Website is only available
          to you — and you should only access the Website — if you agree completely with these terms.
        </StyledP>

        <StyledB>Introduction</StyledB>
        <StyledP>
          The Website provides access to a decentralized protocol on various public blockchains, including but not
          limited to Kaia Chain, that allow users to trade certain compatible digital assets (“the DragonSwap protocol”
          or the “Protocol”), among other services. The Website is one, but not the exclusive, means of accessing the
          Protocol.
        </StyledP>
        <StyledP>
          To access the Website, you must use non-custodial wallet software, which allows you to interact with public
          blockchains. Your relationship with that non-custodial wallet provider is governed by the applicable terms of
          service of that third party, not this Agreement. Wallets are not operated by, maintained by, or affiliated
          with us, and we do not have custody or control over the contents of your wallet and have no ability to
          retrieve or transfer its contents. By connecting your wallet to our Website, you agree to be bound by this
          Agreement and all of the terms incorporated herein by reference.
        </StyledP>

        <StyledB>Modification of this Agreement</StyledB>
        <StyledP>
          We reserve the right, in our sole discretion, to modify this Agreement from time to time. If we make any
          material modifications, we will notify you by updating the date at the top of the Agreement and by maintaining
          a current version of the Agreement at <u>https://dgswap.io/terms</u>. All modifications will be effective when
          they are posted, and your continued accessing or use of the Website will serve as confirmation of your
          acceptance of those modifications. If you do not agree with any modifications to this Agreement, you must
          immediately stop accessing and using the Website.
        </StyledP>

        <StyledB>Description of Services provided through the Website</StyledB>
        <StyledP>The Website provides a web or mobile-based means of accessing the Protocol.</StyledP>

        <StyledB>Website for accessing Protocol</StyledB>
        <StyledP>
          The Website is distinct from the Protocol and is one, but not the exclusive, means of accessing the Protocol.
          DragonSwap does not control or operate any version of the Protocol on any blockchain network. By using the
          Website, you understand that you are not buying or selling digital assets from us and that we do not operate
          any liquidity pools on the Protocol or control trade execution on the Protocol. When traders pay fees for
          trades, those fees accrue to liquidity providers for the Protocol.
        </StyledP>

        <StyledB>Eligibility</StyledB>
        <StyledP>
          To access or use the Website, you must be able to form a legally binding contract with us. Accordingly, you
          represent that you are at least the age of majority in your jurisdiction (e.g., 18 years old in the United
          States) and have the full right, power, and authority to enter into and comply with the terms and conditions
          of this Agreement on behalf of yourself and any company or legal entity for which you may access or use the
          Website.
        </StyledP>
        <StyledP>
          You further represent that you are not (a) the subject of economic or trade sanctions administered or enforced
          by any governmental authority or otherwise designated on any list of prohibited or restricted parties
          (including but not limited to the list maintained by the Office of Foreign Assets Control of the U.S.
          Department of the Treasury) or (b) a citizen, resident, or organized in a jurisdiction or territory that is
          the subject of comprehensive country-wide, territory-wide, or regional economic sanctions by the United
          States. Finally, you represent that your access and use of the Website will fully comply with all applicable
          laws and regulations, and that you will not access or use the Website to conduct, promote, or otherwise
          facilitate any illegal activity.
        </StyledP>

        <StyledB>Additional Rights</StyledB>
        <StyledP>
          We reserve the following rights, which do not constitute obligations of ours: (a) with or without notice to
          you, to modify, substitute, eliminate or add to the Website; (b) to review, modify, filter, disable, delete
          and remove any and all content and information from the Website; and (c) to cooperate with any law
          enforcement, court or government investigation or order or third party requesting or directing that we
          disclose information or content or information that you provide.
        </StyledP>

        <StyledB>Prohibited Activity</StyledB>
        <StyledP>
          You agree not to engage in, or attempt to engage in, any of the following categories of prohibited activity in
          relation to your access and use of the Website:
        </StyledP>
        <StyledUl>
          <li>
            Intellectual Property Infringement. Activity that infringes on or violates any copyright, trademark, service
            mark, patent, right of publicity, right of privacy, or other proprietary or intellectual property rights
            under the law.
          </li>
          <li>
            Cyberattack. Activity that seeks to interfere with or compromise the integrity, security, or proper
            functioning of any computer, server, network, personal device, or other information technology system,
            including (but not limited to) the deployment of viruses and denial of service attacks.
          </li>
          <li>
            Fraud and Misrepresentation. Activity that seeks to defraud us or any other person or entity, including (but
            not limited to) providing any false, inaccurate, or misleading information in order to unlawfully obtain the
            property of another.
          </li>
          <li>
            Market Manipulation. Activity that violates any applicable law, rule, or regulation concerning the integrity
            of trading markets, including (but not limited to) the manipulative tactics commonly known as “rug pulls”,
            pumping and dumping, and wash trading.
          </li>
          <li>
            Securities and Derivatives Violations. Activity that violates any applicable law, rule, or regulation
            concerning the trading of securities or derivatives, including (but not limited to) the unregistered
            offering of securities and the offering of leveraged and margined commodity products to retail customers in
            the United States.
          </li>
          <li>
            Sale of Stolen Property. Buying, selling, or transferring of stolen items, fraudulently obtained items,
            items taken without authorization, and/or any other illegally obtained items.
          </li>
          <li>
            Data Mining or Scraping. Activity that involves data mining, robots, scraping, or similar data gathering or
            extraction methods of content or information from the Website.
          </li>
          <li>
            Objectionable Content. Activity that involves soliciting information from anyone under the age of 18 or that
            is otherwise harmful, threatening, abusive, harassing, tortious, excessively violent, defamatory, vulgar,
            obscene, pornographic, libelous, invasive of another’s privacy, hateful, discriminatory, or otherwise
            objectionable.
          </li>
          <li>
            Any Other Unlawful Conduct. Activity that violates any applicable law, rule, or regulation of the United
            States or another relevant jurisdiction, including (but not limited to) the restrictions and regulatory
            requirements imposed by U.S. law.
          </li>
        </StyledUl>

        <StyledB>Not Registered with the SEC or Any Other Agency</StyledB>
        <StyledP>
          We are not registered with the U.S. Securities and Exchange Commission as a national securities exchange or in
          any other capacity. You understand and acknowledge that we do not broker trading orders on your behalf. We
          also do not facilitate the execution or settlement of your trades, which occur entirely on the public
          distributed blockchains. As a result, we do not (and cannot) guarantee best market pricing or best execution
          through the Website or when using our Smart Router feature, which routes trades across liquidity pools on the
          Protocol only. Any references in the Website to “best price” do not constitute a representation or warranty
          about pricing available through the Website, on the Protocol, or elsewhere.
        </StyledP>

        <StyledB>Non-Solicitation; No Investment Advice</StyledB>
        <StyledP>
          You agree and understand that: (a) all trades you submit through the Website are considered unsolicited, which
          means that they are solely initiated by you; (b) you have not received any investment advice from us in
          connection with any trades, including those you place via our Smart Router API; and (c) we do not conduct a
          suitability review of any trades you submit.
        </StyledP>
        <StyledP>
          We may provide information about tokens in the Website sourced from third-party data partners through features
          such as rarity scores, token explorer, or token lists. We may also provide warning labels for certain tokens.
          The provision of informational materials does not make trades in those tokens solicited; we are not attempting
          to induce you to make any purchase as a result of the information provided. All such information provided by
          the Website is for informational purposes only and should not be construed as investment advice or a
          recommendation that a particular token is a safe or sound investment. You should not take, or refrain from
          taking, any action based on any information contained in the Website. By providing token information for your
          convenience, we do not make any investment recommendations to you or opine on the merits of any transaction or
          opportunity. You alone are responsible for determining whether any investment, investment strategy or related
          transaction is appropriate for you based on your personal investment objectives, financial circumstances, and
          risk tolerance.
        </StyledP>

        <StyledB>Non-Custodial and No Fiduciary Duties</StyledB>
        <StyledP>
          The Website is a purely non-custodial application, meaning we do not ever have custody, possession, or control
          of your digital assets at any time. It further means you are solely responsible for the custody of the
          cryptographic private keys to the digital asset wallets you hold and you should never share your wallet
          credentials or seed phrase with anyone. We accept no responsibility for, or liability to you, in connection
          with your use of a wallet and make no representations or warranties regarding how the Website will operate
          with any specific wallet. Likewise, you are solely responsible for any associated wallet and we are not liable
          for any acts or omissions by you in connection with or as a result of your wallet being compromised.
        </StyledP>
        <StyledP>
          This Agreement is not intended to, and does not, create or impose any fiduciary duties on us. To the fullest
          extent permitted by law, you acknowledge and agree that we owe no fiduciary duties or liabilities to you or
          any other party, and that to the extent any such duties or liabilities may exist at law or in equity, those
          duties and liabilities are hereby irrevocably disclaimed, waived, and eliminated. You further agree that the
          only duties and obligations that we owe you are those set out expressly in this Agreement.
        </StyledP>

        <StyledB>Compliance and Tax Obligations</StyledB>
        <StyledP>
          The Website may not be available or appropriate for use in your jurisdiction. By accessing or using the
          Website, you agree that you are solely and entirely responsible for compliance with all laws and regulations
          that may apply to you.
        </StyledP>
        <StyledP>
          Specifically, your use of the Website or the Protocol may result in various tax consequences, such as income
          or capital gains tax, value-added tax, goods and services tax, or sales tax in certain jurisdictions.It is
          your responsibility to determine whether taxes apply to any transactions you initiate or receive and, if so,
          to report and/or remit the correct tax to the appropriate tax authority.
        </StyledP>

        <StyledB>Assumption of Risk</StyledB>
        <StyledP>
          By accessing and using the Website, you represent that you are financially and technically sophisticated
          enough to understand the inherent risks associated with using cryptographic and blockchain-based systems, and
          that you have a working knowledge of the usage and intricacies of digital assets such as ether (ETH),
          so-called stablecoins, and other digital tokens such as those following the Ethereum Token Standard (ERC-20),
          or standards of any other digital tokens which are transacted on DragonSwap.
        </StyledP>
        <StyledP>
          In particular, you understand that the markets for these digital assets are nascent and highly volatile due to
          risk factors including (but not limited to) adoption, speculation, technology, security, and regulation. You
          understand that anyone can create a token, including fake versions of existing tokens and tokens that falsely
          claim to represent projects, and acknowledge and accept the risk that you may mistakenly trade those or other
          tokens. So-called stablecoins may not be as stable as they purport to be, may not be fully or adequately
          collateralized, and may be subject to panics and runs.
        </StyledP>
        <StyledP>
          Further, you understand that smart contract transactions automatically execute and settle, and that
          blockchain-based transactions are irreversible when confirmed. You acknowledge and accept that the cost and
          speed of transacting with cryptographic and blockchain-based systems such as Ethereum are variable and may
          increase dramatically at any time. You further acknowledge and accept the risk of selecting to trade in Expert
          Modes, which can expose you to potentially significant price slippage and higher costs.
        </StyledP>
        <StyledP>
          If you act as a liquidity provider to the Protocol through the Website, you understand that your digital
          assets may lose some or all of their value while they are supplied to the Protocol through the Website due to
          the fluctuation of prices of tokens in a trading pair or liquidity pool.
        </StyledP>
        <StyledP>
          Finally, you understand that we do not create, own, or operate cross-chain bridges and we do not make any
          representation or warranty about the safety or soundness of any cross-chain bridge, including its use for
          DragonSwap governance.
        </StyledP>
        <StyledP>
          In summary, you acknowledge that we are not responsible for any of these variables or risks, do not own or
          control the Protocol, and cannot be held liable for any resulting losses that you experience while accessing
          or using the Website. Accordingly, you understand and agree to assume full responsibility for all of the risks
          of accessing and using the Website to interact with the Protocol.
        </StyledP>

        <StyledB>Third-Party Resources and Promotions</StyledB>
        <StyledP>
          The Website may contain references or links to third-party resources, including (but not limited to)
          information, materials, products, or services, that we do not own or control. In addition, third parties may
          offer promotions related to your access and use of the Website. We do not approve, monitor, endorse, warrant
          or assume any responsibility for any such resources or promotions. If you access any such resources or
          participate in any such promotions, you do so at your own risk, and you understand that this Agreement does
          not apply to your dealings or relationships with any third parties. You expressly relieve us of any and all
          liability arising from your use of any such resources or participation in any such promotions.
        </StyledP>

        <StyledB>Release of Claims</StyledB>
        <StyledP>
          You expressly agree that you assume all risks in connection with your access and use of the Website. You
          further expressly waive and release us from any and all liability, claims, causes of action, or damages
          arising from or in any way relating to your use of the Website. If you are a California resident, you waive
          the benefits and protections of California Civil Code § 1542, which provides: "[a] general release does not
          extend to claims that the creditor or releasing party does not know or suspect to exist in his or her favor at
          the time of executing the release and that, if known by him or her, would have materially affected his or her
          settlement with the debtor or released party."
        </StyledP>

        <StyledB>Indemnity</StyledB>
        <StyledP>
          You agree to hold harmless, release, defend, and indemnify us and our officers, directors, employees,
          contractors, agents, affiliates, and subsidiaries from and against all claims, damages, obligations, losses,
          liabilities, costs, and expenses arising from: (a) your access and use of the Website; (b) your violation of
          any term or condition of this Agreement, the right of any third party, or any other applicable law, rule, or
          regulation; and (c) any other party's access and use of the Website with your assistance or using any device
          or account that you own or control.
        </StyledP>

        <StyledB>No Warranties</StyledB>
        <StyledP>
          The website is provided on an "as is" and "as available" basis. To the fullest extent permitted by law, we
          disclaim any representations and warranties of any kind, whether express, implied, or statutory, including
          (but not limited to) the warranties of merchantability and fitness for a particular purpose. You acknowledge
          and agree that your use of the website is at your own risk. We do not represent or warrant that access to the
          website will be continuous, uninterrupted, timely, or secure; that the information contained in the website
          will be accurate, reliable, complete, or current; or that the website will be free from errors, defects,
          viruses, or other harmful elements. No advice, information, or statement that we make should be treated as
          creating any warranty concerning the website. We do not endorse, guarantee, or assume responsibility for any
          advertisements, offers, or statements made by third parties concerning the website.
        </StyledP>
        <StyledP>
          Similarly, the protocol is provided "as is", at your own risk, and without warranties of any kind. Although we
          contributed to the initial code for the protocol, we do not provide, own, or control the protocol, which is
          run autonomously without any headcount by smart contracts deployed on various blockchains. No developer or
          entity involved in creating the protocol will be liable for any claims or damages whatsoever associated with
          your use, inability to use, or your interaction with other users of, the protocol, including any direct,
          indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits,
          cryptocurrencies, tokens, or anything else of value. We do not endorse, guarantee, or assume responsibility
          for any advertisements, offers, or statements made by third parties concerning the website.
        </StyledP>

        <StyledB>Limitation of Liability</StyledB>
        <StyledP>
          Under no circumstances shall we or any of our officers, directors, employees, contractors, agents, affiliates,
          or subsidiaries be liable to you for any indirect, punitive, incidental, special, consequential, or exemplary
          damages, including (but not limited to) damages for loss of profits, goodwill, use, data, or other intangible
          property, arising out of or relating to any access or use of the interface, nor will we be responsible for any
          damage, loss, or injury resulting from hacking, tampering, or other unauthorized access or use of the
          interface or the information contained within it. We assume no liability or responsibility for any: (a)
          errors, mistakes, or inaccuracies of content; (b) personal injury or property damage, of any nature
          whatsoever, resulting from any access or use of the interface; (c) unauthorized access or use of any secure
          server or database in our control, or the use of any information or data stored therein; (d) interruption or
          cessation of function related to the interface; (e) bugs, viruses, trojan horses, or the like that may be
          transmitted to or through the interface; (f) errors or omissions in, or loss or damage incurred as a result of
          the use of, any content made available through the interface; and (g) the defamatory, offensive, or illegal
          conduct of any third party.
        </StyledP>

        <StyledB>Class Action and Jury Trial Waiver</StyledB>
        <StyledP>
          You must bring any and all Disputes against us in your individual capacity and not as a plaintiff in or member
          of any purported class action, collective action, private attorney general action, or other representative
          proceeding. This provision applies to class arbitration. You and we both agree to waive the right to demand a
          trial by jury.
        </StyledP>

        <StyledB>Entire Agreement</StyledB>
        <StyledP>
          These terms constitute the entire agreement between you and us with respect to the subject matter hereof. This
          Agreement supersedes any and all prior or contemporaneous written and oral agreements, communications and
          other understandings (if any) relating to the subject matter of the terms.
        </StyledP>

        <StyledB>Gas Fees</StyledB>
        <StyledP>
          Blockchain transactions require the payment of transaction fees to the appropriate network (“Gas Fees”).
          Except as otherwise expressly outlined in the terms of another offer by DragonSwap, you will be solely
          responsible for paying the Gas Fees for any transaction that you initiate.
        </StyledP>
      </StyledTextBox>
    </StyledLayer>
  )
}

TermsPage.chains = CHAIN_IDS

export default TermsPage
