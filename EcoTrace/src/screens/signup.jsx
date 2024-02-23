import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform, Alert, Modal, ScrollView, } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import googleIcon from '../theme/images/google-icon.png';
import { registerUser, handleGoogleSignIn } from './firestore.js';
import { useUser } from './userContext.js';
import AppContext from '../theme/AppContext'

const SignUpScreen = ({ navigation }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSelected, setSelection] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const { setUserId } = useUser();
  const { setShowOverlay } = useContext(AppContext);

  // Function to validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  // Function to check if password match
  useEffect(() => {
    validatePassword();
  }, [password, confirmPassword]);

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  // Functions to toggle password visibility
  const togglePasswordVisibility = type => {
    if (type === 'password') {
      setPasswordVisible(prev => !prev);
    } else if (type === 'confirmPassword') {
      setConfirmPasswordVisible(prev => !prev);
    }
  };

  // Handle the signup process
  const handleSignUp = async () => {
    // Ensure email is entered
    if (!email) {
      setShowOverlay(true);
      Alert.alert('Missing Information', 'Please enter your email.', [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
      return;
    }

    // Check for valid email format
    if (emailError) {
      setShowOverlay(true);
      Alert.alert('Error', 'Please enter a valid email address.', [
        {
          text: 'OK', onPress: () => setShowOverlay(false)
        }
      ]);
      return;
    }

    // Ensure both password and confirm password are entered
    if (!password || !confirmPassword) {
      setShowOverlay(true);
      Alert.alert('Missing Information', 'Please enter both password and confirm password.', [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setShowOverlay(true);
      Alert.alert('Error', 'Passwords do not match.', [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
      return;
    }

    // Check if terms of use and privacy policy are accepted
    if (!isSelected) {
      setShowOverlay(true);
      Alert.alert('Error', 'You must accept the Terms of Use and Privacy Policy.', [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
      return;
    }

    // Proceed with Firebase signup
    const result = await registerUser(email, password);
    if (result.success) {
      setUserId(result.userId);
      setShowOverlay(true);
      Alert.alert(
        'Verify Email',
        'A verification email has been sent to your email. Please verify to complete registration.', [
        {
          text: 'OK', onPress: () => {
            setShowOverlay(false);
            navigation.goBack();
          }
        },
      ]);
    } else {
      setShowOverlay(true);
      Alert.alert('Registration Error', result.error, [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
    }
  };

  // Handle the google signup process
  const onGoogleButtonPress = async () => {
    const result = await handleGoogleSignIn();
    if (result.success) {
      setUserId(result.userId);
      if (result.isNewUser) {
        navigation.navigate('Userinfo');
      } else {
        navigation.navigate('BottomTabs');
      }
    } else {
      setShowOverlay(true);
      Alert.alert('Login failed', result.error, [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
    }
  };


  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleTermsPress = () => {
    settitletxt('TERMS OF USE')
    setmodaltxt(termsofus)
  };

  const handlePrivacyPress = () => {
    settitletxt('PRIVACY POLICY')
    setmodaltxt(privacy_policy)
  };

  const privacy_policy = `Last updated January 24, 2024

  This privacy notice for us, describes how and why we might collect, store, use, and/or share ('process') your information when you use our services ('Services'), such as when you:

  *   Download and use our mobile application (EcoTrace), or any other application of ours that links to this privacy notice
  *   Engage with us in other related ways, including any sales, marketing, or events
  Questions or concerns? Reading this privacy notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at ecotracenz@gmail.com.
  
  SUMMARY OF KEY POINTS

  This summary provides key points from our privacy notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our table of contents below to find the section you are looking for.

  What personal information do we process? When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. 

  Do we process any sensitive personal information? We do not process sensitive personal information.

  Do we receive any information from third parties? We do not receive any information from third parties.

  How do we process your information? We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. 

  In what situations and with which parties do we share personal information? We may share information in specific situations and with specific third parties.

  How do we keep your information safe? We have organisational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorised third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. 

  What are your rights? Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.

  How do you exercise your rights? The easiest way to exercise your rights is by submitting a data subject access request, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.
  
  Want to learn more about what we do with any information we collect? Review the privacy notice in full.
  
  
  1. WHAT INFORMATION DO WE COLLECT?
  Personal information you disclose to us
  In Short: We collect personal information that you provide to us.
  We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
  Personal Information Provided by You. The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
  
  *   email addresses
  *   usernames
  *   passwords
  
  Sensitive Information. We do not process sensitive information.
  Social Media Login Data. We may provide you with the option to register with us using your existing social media account details, like your Facebook, Twitter, or other social media account. If you choose to register in this way, we will collect the information described in the section called 'HOW DO WE HANDLE YOUR SOCIAL LOGINS?' below.
  Application Data. If you use our application(s), we also may collect the following information if you choose to provide us with access or permission:
  
  *   Geolocation Information. We may request access or permission to track location-based information from your mobile device, either continuously or while you are using our mobile application(s), to provide certain location-based services. If you wish to change our access or permissions, you may do so in your device's settings.
  *   Mobile Device Access. We may request access or permission to certain features from your mobile device, including your mobile device's sensors, and other features. If you wish to change our access or permissions, you may do so in your device's settings.
  *   Mobile Device Data. We automatically collect device information (such as your mobile device ID, model, and manufacturer), operating system, version information and system configuration information, device and application identification numbers, browser type and version, hardware model Internet service provider and/or mobile carrier, and Internet Protocol (IP) address (or proxy server). If you are using our application(s), we may also collect information about the phone network associated with your mobile device, your mobile device's operating system or platform, the type of mobile device you use, your mobile device’s unique device ID, and information about the features of our application(s) you accessed.
  *   Push Notifications. We may request to send you push notifications regarding your account or certain features of the application(s). If you wish to opt out from receiving these types of communications, you may turn them off in your device's settings.
 
  This information is primarily needed to maintain the security and operation of our application(s), for troubleshooting, and for our internal analytics and reporting purposes.
  All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.
  
  2. HOW DO WE PROCESS YOUR INFORMATION?
  
  In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.
  We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
 
  *   To facilitate account creation and authentication and otherwise manage user accounts. We may process your information so you can create and log in to your account, as well as keep your account in working order.
  *   To deliver and facilitate delivery of services to the user. We may process your information to provide you with the requested service.
  *   To evaluate and improve our Services, products, marketing, and your experience. We may process your information when we believe it is necessary to identify usage trends, determine the effectiveness of our promotional campaigns, and to evaluate and improve our Services, products, marketing, and your experience.
  *   To identify usage trends. We may process information about how you use our Services to better understand how they are being used so we can improve them.
  
  
  3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
  
  In Short: We may share information in specific situations described in this section and/or with the following third parties.
  We may need to share your personal information in the following situations:
  
  *   Business Transfers. We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
  *   When we use Google Maps Platform APIs. We may share your information with certain Google Maps Platform APIs (e.g. Google Maps API, Places API).
  *   Business Partners. We may share your information with our business partners to offer you certain products, services, or promotions.
  *   Offer Wall. Our application(s) may display a third-party hosted 'offer wall'. Such an offer wall allows third-party advertisers to offer virtual currency, gifts, or other items to users in return for the acceptance and completion of an advertisement offer. Such an offer wall may appear in our application(s) and be displayed to you based on certain data, such as your geographic area or demographic information. When you click on an offer wall, you will be brought to an external website belonging to other persons and will leave our application(s). A unique identifier, such as your user ID, will be shared with the offer wall provider in order to prevent fraud and properly credit your account with the relevant reward.
  
  4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
  
  In Short: We may use cookies and other tracking technologies to collect and store your information.
  We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.
  
  5. HOW DO WE HANDLE YOUR SOCIAL LOGINS?
  
  In Short: If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.
  Our Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or Twitter logins). Where you choose to do this, we will receive certain profile information about you from your social media provider. The profile information we receive may vary depending on the social media provider concerned, but will often include your name, email address, friends list, and profile picture, as well as other information you choose to make public on such a social media platform.
  We will use the information we receive only for the purposes that are described in this privacy notice or that are otherwise made clear to you on the relevant Services. Please note that we do not control, and are not responsible for, other uses of your personal information by your third-party social media provider. We recommend that you review their privacy notice to understand how they collect, use, and share your personal information, and how you can set your privacy preferences on their sites and apps.
  
  6. HOW LONG DO WE KEEP YOUR INFORMATION?
  
  In Short: We keep your information for as long as necessary to fulfil the purposes outlined in this privacy notice unless otherwise required by law.
  We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.
  When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymise such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
  
  7. HOW DO WE KEEP YOUR INFORMATION SAFE?
  
  In Short: We aim to protect your personal information through a system of organisational and technical security measures.
  We have implemented appropriate and reasonable technical and organisational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorised third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.
  
  8. WHAT ARE YOUR PRIVACY RIGHTS?
  
  In Short: You may review, change, or terminate your account at any time.
  Withdrawing your consent: If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section 'HOW CAN YOU CONTACT US ABOUT THIS NOTICE?' below.
  However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.
  Account Information
  If you would at any time like to review or change the information in your account or terminate your account, you can:
  
  *   Log in to your account settings and update your user account.
  *   Contact us using the contact information provided.
  
  Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.
  If you have questions or comments about your privacy rights, you may email us at ecotracenz@gmail.com.
  
  9. CONTROLS FOR DO-NOT-TRACK FEATURES
  
  Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage no uniform technology standard for recognising and implementing DNT signals has been finalised. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this privacy notice.
  
  10. DO OTHER REGIONS HAVE SPECIFIC PRIVACY RIGHTS?
  
  In Short: You may have additional rights based on the country you reside in.
  New Zealand
  We collect and process your personal information under the obligations and conditions set by New Zealand's Privacy Act 2020 (Privacy Act).
  This privacy notice satisfies the notice requirements defined in the Privacy Act, in particular: what personal information we collect from you, from which sources, for which purposes, and other recipients of your personal information.
  If you do not wish to provide the personal information necessary to fulfil their applicable purpose, it may affect our ability to provide our services, in particular:
 
  *   offer you the products or services that you want
  *   respond to or help with your requests
  *   manage your account with us
  *   confirm your identity and protect your account
 
  At any time, you have the right to request access to or correction of your personal information. You can make such a request by contacting us by using the contact details provided in the section 'HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?'
  If you believe we are unlawfully processing your personal information, you have the right to submit a complaint about a breach of New Zealand's Privacy Principles to the Office of New Zealand Privacy Commissioner.
  
  11. DO WE MAKE UPDATES TO THIS NOTICE?
  
  In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws.
  We may update this privacy notice from time to time. The updated version will be indicated by an updated 'Revised' date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.
  
  12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
  
  If you have questions or comments about this notice, you may email us at ecotracenz@gmail.com
  
  13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
  
  Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, change that information, or delete it. To request to review, update, or delete your personal information, please fill out and submit a data subject access request.
  This privacy policy was created using Termly's Privacy Policy Generator.
  `;
  const termsofus = `We are KeepReal.

  We operate , as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").
  
  You can contact us by email at ecotracenz@gmail.com
  
  These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms.
  
   IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
  
  Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Legal Terms by your continued use of the Services after the date such revised Legal Terms are posted.
  
  We recommend that you print a copy of these Legal Terms for your records.
  
  1. OUR SERVICES
  
  The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
  
  2. INTELLECTUAL PROPERTY RIGHTS
  
  Our intellectual property
  We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
  
  Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties in the United States and around the world.
 
  The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.
  
  Your use of our Services
  Subject to your compliance with these Legal Terms, including the "PROHIBITED ACTIVITIES" section below, we grant you a non-exclusive, non-transferable, revocable licence to:
  
  * access the Services; and
  * download or print a copy of any portion of the Content to which you have properly gained access.
  
  solely for your personal, non-commercial use or internal business purpose.
 
  Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
  
  If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: ecotracenz@gmail.com. If we ever grant you the permission to post, reproduce, or publicly display any part of our Services or Content, you must identify us as the owners or licensors of the Services, Content, or Marks and ensure that any copyright or proprietary notice appears or is visible on posting, reproducing, or displaying our Content.
  
  We reserve all rights not expressly granted to you in and to the Services, Content, and Marks.
  
  Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.
  
  Your submissions
  Please review this section and the "PROHIBITED ACTIVITIES" section carefully prior to using our Services to understand the (a) rights you give us and (b) obligations you have when you post or upload any content through the Services.
  Submissions: By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services ("Submissions"), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.
  You are responsible for what you post or upload: By sending us Submissions through any part of the Services you:
  
  * confirm that you have read and agree with our "PROHIBITED ACTIVITIES" and will not post, send, publish, upload, or transmit through the Services any Submission that is illegal, harassing, hateful, harmful, defamatory, obscene, bullying, abusive, discriminatory, threatening to any person or group, sexually explicit, false, inaccurate, deceitful, or misleading;
  * to the extent permissible by applicable law, waive any and all moral rights to any such Submission;
  * warrant that any such Submission are original to you or that you have the necessary rights and licences to submit such Submissions and that you have full authority to grant us the above-mentioned rights in relation to your Submissions; and
  
  * warrant and represent that your Submissions do not constitute confidential information.
  You are solely responsible for your Submissions and you expressly agree to reimburse us for any and all losses that we may suffer because of your breach of (a) this section, (b) any third party’s intellectual property rights, or (c) applicable law.
  
  3. USER REPRESENTATIONS
  
  By using the Services, you represent and warrant that: (1) you have the legal capacity and you agree to comply with these Legal Terms; (2) you are not a minor in the jurisdiction in which you reside; (3) you will not access the Services through automated or non-human means, whether through a bot, script or otherwise; (4) you will not use the Services for any illegal or unauthorised purpose; and (5) your use of the Services will not violate any applicable law or regulation.
  If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).
  
  4. PROHIBITED ACTIVITIES
  
  You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavours except those that are specifically endorsed or approved by us.
  As a user of the Services, you agree not to:
  
  * Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.
  * Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.
  * Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.
  * Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.
  * Use any information obtained from the Services in order to harass, abuse, or harm another person.
  * Make improper use of our support services or submit false reports of abuse or misconduct.
  * Use the Services in a manner inconsistent with any applicable laws or regulations.
  * Engage in unauthorised framing of or linking to the Services.
  * Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party's uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.
  * Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.
  * Delete the copyright or other proprietary rights notice from any Content.
  * Attempt to impersonate another user or person or use the username of another user.
  * Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats ("gifs"), 1×1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as "spyware" or "passive collection mechanisms" or "pcms").
  * Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.
  * Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.
  * Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.
  * Copy or adapt the Services’ software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.
  * Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.
  * Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or use or launch any unauthorised script or other software.
  * Use a buying agent or purchasing agent to make purchases on the Services.
  * Make any unauthorised use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretences.
  * Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavour or commercial enterprise.
 
  USER GENERATED CONTRIBUTIONS
  The Services does not offer users to submit or post content. We may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions"). Contributions may be viewable by other users of the Services and through third-party websites. When you create or make available any Contributions, you thereby represent and warrant that:
  
  6. CONTRIBUTION LICENCE
 
  You and Services agree that we may access, store, process, and use any information and personal data that you provide and your choices (including settings).
  By submitting suggestions or other feedback regarding the Services, you agree that we can use and share such feedback for any purpose without compensation to you.
  We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions and any intellectual property rights or other proprietary rights associated with your Contributions. We are not liable for any statements or representations in your Contributions provided by you in any area on the Services. You are solely responsible for your Contributions to the Services and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.
  
  7. SERVICES MANAGEMENT
  
  We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.
  
  8. TERM AND TERMINATION
  
  These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.
  If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.
  
  9. MODIFICATIONS AND INTERRUPTIONS
  
  We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.
  We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Services during any downtime or discontinuance of the Services. Nothing in these Legal Terms will be construed to obligate us to maintain and support the Services or to supply any corrections, updates, or releases in connection therewith.
  
  10.GOVERNING LAW
  
  These Legal Terms shall be governed by and defined following the laws of New Zealand, and you irrevocably consent that the courts of New Zealand shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.
  
  11.DISPUTE RESOLUTION
  
  Informal Negotiations
  To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a "Dispute" and collectively, the "Disputes") brought by either you or us (individually, a "Party" and collectively, the "Parties"), the Parties agree to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally for at least 30 days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.
  
  Binding Arbitration
  Any dispute arising out of or in connection with these Legal Terms, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by the International Commercial Arbitration Court under the European Arbitration Chamber (Belgium, Brussels, Avenue Louise, 146) according to the Rules of this ICAC, which, as a result of referring to it, is considered as the part of this clause. The number of arbitrators shall be 3. The seat, or legal place, or arbitration shall be New Zealand. The language of the proceedings shall be British English. The governing law of these Legal Terms shall be substantive law of New Zealand.
  
  Restrictions
  The Parties agree that any arbitration shall be limited to the Dispute between the Parties individually. To the full extent permitted by law, (a) no arbitration shall be joined with any other proceeding; (b) there is no right or authority for any Dispute to be arbitrated on a class-action basis or to utilise class action procedures; and (c) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.
  
  Exceptions to Informal Negotiations and Arbitration
  The Parties agree that the following Disputes are not subject to the above provisions concerning informal negotiations binding arbitration: (a) any Disputes seeking to enforce or protect, or concerning the validity of, any of the intellectual property rights of a Party; (b) any Dispute related to, or arising from, allegations of theft, piracy, invasion of privacy, or unauthorised use; and (c) any claim for injunctive relief. If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.
  
  12. CORRECTIONS
  
  There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.
  
  13. DISCLAIMER
  
  THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES, (3) ANY UNAUTHORISED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICES, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGEMENT AND EXERCISE CAUTION WHERE APPROPRIATE.
  
  14. LIMITATIONS OF LIABILITY
 
  IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE LESSER OF THE AMOUNT PAID, IF ANY, BY YOU TO US OR . CERTAIN US STATE LAWS AND INTERNATIONAL LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.
  
  15. INDEMNIFICATION
  
  You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys’ fees and expenses, made by any third party due to or arising out of: (1) use of the Services; (2) breach of these Legal Terms; (3) any breach of your representations and warranties set forth in these Legal Terms; (4) your violation of the rights of a third party, including but not limited to intellectual property rights; or (5) any overt harmful act toward any other user of the Services with whom you connected via the Services. Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defence and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defence of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.
  
  16. USER DATA
 
  We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services. You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.
  
  17. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES
  
  Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES. You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.
  
  18. MISCELLANEOUS
  
  These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Legal Terms or use of the Services. You agree that these Legal Terms will not be construed against us by virtue of having drafted them. You hereby waive any and all defences you may have based on the electronic form of these Legal Terms and the lack of signing by the parties hereto to execute these Legal Terms.
  
  19.CONTACT US
  
  In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
  ecotracenz@gmail.com
  
  These terms of use were created using Termly's Terms and Conditions Generator.
  `;

  const [titletxt, settitletxt] = useState('');
  const [modaltxt, setmodaltxt] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text
          style={[
            styles.headerText,
            Platform.OS === 'ios' ? styles.headerTextIOS : null,
          ]}>
          Create Account
        </Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputWithIcon}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              validateEmail(text);
            }}
          />
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <View style={styles.inputWithIcon}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => togglePasswordVisibility('password')}>
            <MaterialCommunityIcons
              name={passwordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="grey"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputWithIcon}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry={!confirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => togglePasswordVisibility('confirmPassword')}>
            <MaterialCommunityIcons
              name={passwordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="grey"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <View style={styles.acceptContainer}>
          <TouchableOpacity
            style={styles.acceptTermContainer}
            onPress={() => setSelection(!isSelected)}>
            <View style={[styles.checkbox, isSelected ? styles.checkboxSelected : null]}>
              {isSelected && <Icon name="check" size={12} color="#fff" />}
            </View>
            <Text style={styles.acceptText}>
              I accept the{' '}
              <Text style={styles.linkText} onPress={() => {
                toggleModal();
                handleTermsPress();
              }}>
                Terms of Use
              </Text>{' '}
              &{' '}
              <Text style={styles.linkText} onPress={() => {
                toggleModal();
                handlePrivacyPress();
              }}>
                Privacy Policy
              </Text>
              .
            </Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}>
          <View style={styles.modalBackground}>
            <ScrollView style={styles.modalContainer}>
              <View style={styles.textcon}>
                <Text style={styles.titletxt}>{titletxt}</Text>
                <Text style={styles.modaltxt}>{modaltxt}</Text>
                <TouchableOpacity
                  onPress={() => toggleModal()}
                  style={styles.bto2}>
                  <Text style={styles.buttonText2}>BACK</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </Modal>
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>SIGN UP</Text>
        </TouchableOpacity>
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.socialIconsContainer}>
          <TouchableOpacity
            onPress={onGoogleButtonPress}
            style={styles.socialIconButton}>
            <View style={styles.socialIconCircle}>
              <Image source={googleIcon} style={styles.socialIcon} />
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.signInContainer,
            Platform.OS === 'ios' ? styles.signInContainerIOS : null,
          ]}>
          <Text style={styles.signInText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B0D9B1',
  },
  headerContainer: {
    marginTop: 30,
    marginLeft: 20,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
  headerTextIOS: {
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 50,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 70,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  acceptContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  acceptTermContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  checkbox: {
    height: 15,
    width: 15,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 2,
  },
  checkboxSelected: {
    backgroundColor: '#5E8C61',
    borderColor: '#5E8C61',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptText: {
    color: '#1F2937',
  },
  linkText: {
    textDecorationLine: 'underline',
    color: '#5E8C61',
    fontWeight: 'bold',
  },
  signUpButton: {
    width: 342,
    height: 45,
    backgroundColor: '#B0D9B1',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  orText: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 8,
    marginTop: 15,
    marginBottom: 15,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 15,
  },
  socialIconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#BABABA',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
  },
  socialIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  signInContainer: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInContainerIOS: {
    marginTop: 120,
  },
  signInText: {
    color: '#000',
  },
  signInButtonText: {
    textDecorationLine: 'underline',
    color: '#5E8C61',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 15,
    alignSelf: 'center',
    marginVertical: 60,
  },
  modalBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textcon: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  titletxt: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 25,
    color: '#3E3838',
  },
  modaltxt: {
    color: '#787878',
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 15,
  },
  buttonText2: {
    fontWeight: '300',
    fontSize: 20,
    color: '#898989',
  },
  bto2: {
    height: 45,
    width: 145,
    backgroundColor: '#DADADA',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginHorizontal: 8,
    marginBottom: 30,
  },
});

export default SignUpScreen;
