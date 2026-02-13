/**
 * EN / NL translation dictionaries for the bottle configurator.
 *
 * Convention:  area.keyName
 *   area = component or logical section
 *   keyName = camelCase description
 *
 * Interpolation placeholders use {varName} syntax.
 */

const translations = {
    // =========================================================================
    // ENGLISH
    // =========================================================================
    en: {
        // -- Tabs / Navigation ------------------------------------------------
        'tab.front': 'FRONT',
        'tab.back': 'BACK',

        // -- Product info -----------------------------------------------------
        'product.heading': 'RAMBLER® 16 OZ TRAVEL BOTTLE',
        'product.colorLabel': 'PRODUCT COLOR:',
        'product.colorLabelShort': 'COLOR:',

        // -- Color names ------------------------------------------------------
        'color.black': 'BLACK',
        'color.white': 'WHITE',
        'color.blue': 'BLUE',
        'color.red': 'RED',
        'color.selectAria': 'Select {color} color',
        'color.update': 'UPDATE',

        // -- Main view --------------------------------------------------------
        'main.heading': 'CUSTOMIZE IT YOUR WAY',
        'main.uploadOwn': 'UPLOAD YOUR OWN IMAGE',
        'main.text': 'TEXT',
        'main.monogram': 'MONOGRAM',
        'main.valentines': 'VALENTINES DESIGNS',
        'main.gallery': 'GALLERY',

        // -- Bottom bar -------------------------------------------------------
        'bottomBar.remove': 'REMOVE',
        'bottomBar.review': 'REVIEW',
        'bottomBar.preparing': 'PREPARING...',

        // -- Text view --------------------------------------------------------
        'text.back': 'BACK',
        'text.placeholder': 'TYPE TEXT HERE',
        'text.orientationLabel': 'Orientation:',
        'text.vertical': 'Vertical',
        'text.horizontal': 'Horizontal',
        'text.verticalAria': 'Vertical Text',
        'text.horizontalAria': 'Horizontal Text',

        // -- Monogram view ----------------------------------------------------
        'monogram.back': 'BACK',
        'monogram.placeholderSingle': 'ONE LETTER ONLY',
        'monogram.placeholderMinTwo': 'AT LEAST 2 LETTERS',
        'monogram.placeholderDefault': 'ENTER YOUR INITIALS',
        'monogram.warnSingleLetter': 'ONLY FIRST LETTER WILL BE SHOWN',
        'monogram.warnMinTwo': 'PLEASE ENTER AT LEAST 2 LETTERS',
        'monogram.noteLabel': 'Note:',
        'monogram.noteText': 'Monograms with three initials display the last name initial in the center.',

        // -- Gallery view -----------------------------------------------------
        'gallery.back': 'BACK',
        'gallery.backToCategories': 'BACK TO CATEGORIES',
        'gallery.selectedLabel': 'SELECTED: {name}',

        // -- Gallery categories -----------------------------------------------
        'gallery.cat.nature': 'NATURE',
        'gallery.cat.animals': 'ANIMALS',
        'gallery.cat.symbols': 'SYMBOLS',
        'gallery.cat.celebration': 'CELEBRATION',
        'gallery.cat.family': 'FAMILY',
        'gallery.cat.fan_favorites': 'FAN FAVORITES',
        'gallery.cat.valentines': 'VALENTINES',
        'gallery.cat.zodiac': 'ZODIAC',

        // -- Upload view ------------------------------------------------------
        'upload.back': '{side}',
        'upload.uploadFailed': 'Upload Failed',
        'upload.errorPdf': 'Failed to render PDF preview. File may be corrupted or password protected.',
        'upload.errorAspectRatio': 'Image aspect ratio ({ratio}) is outside the allowed range. Please use an image closer to square (between 2:3 and 3:2).',
        'upload.errorLoadImage': 'Failed to load image. Please check the file.',
        'upload.errorProcessing': 'Error processing file.',
        'upload.processing': 'Processing...',
        'upload.uploadDesign': 'UPLOAD DESIGN',
        'upload.acceptedTypes': 'Accepted file types: PNG, JPG, SVG and PDF',
        'upload.iconImageSize': 'Image must be 300 px\n(W or H)',
        'upload.iconNoTrademark': 'No trademark infringement',
        'upload.iconNoCopyright': 'No copyright infringement',
        'upload.iconNoPhotos': 'No photos',
        'upload.instructionsHeading': 'INSTRUCTIONS',
        'upload.instruction1': 'Orders containing offensive, inappropriate, or copyrighted content may be cancelled without further notice.',
        'upload.instruction2': 'Please verify your preview carefully: check for any unwanted lines or spots and crop them out.',
        'upload.instruction3': 'For best results, commence with a sketch on white paper using a thick dark marker. Keep it simple and take a photo in a well-lit area without shadows.',
        'upload.instruction4': 'Photographs will be converted to black and white, and results may vary. Proceed with high-contrast images for optimal engraving quality.',
        'upload.sizeLabel': 'SIZE',
        'upload.removeImage': 'Remove Image',
        'upload.placementHint': 'Review your placement on the bottle preview to the left.',
        'upload.previewAlt': 'Preview',

        // -- Review screen ----------------------------------------------------
        'review.addingToCart': 'Adding to cart...',
        'review.logoAlt': 'Logo',
        'review.frontPreviewAlt': 'Front Preview',
        'review.backPreviewAlt': 'Back Preview',
        'review.closeAria': 'Close Review',
        'review.heading': 'Review Your Design',
        'review.deliveryNotice': 'Please allow 7 business days for personalization and 2-3 days for delivery. Delivery dates cannot be guaranteed. ALL PURCHASES ARE FINAL.',
        'review.noPreview': 'No Preview Available',
        'review.editFront': 'Edit Front',
        'review.editBack': 'Edit Back',
        'review.footerNotice': 'Please review your spelling and design. Custom products cannot be returned.',
        'review.backButton': 'Back',
        'review.addToCart': 'Add to Cart',
        'review.adding': 'Adding...',
        'review.errorDefault': 'Failed to add to cart. Please try again.',

        // -- Confirmation modal -----------------------------------------------
        'confirm.heading': 'Confirm This',
        'confirm.body1': 'The submitted image and/or text is not unlawful, harmful, threatening, tortious, defamatory, vulgar, obscene, libelous, invasive of another\'s privacy, hateful, or racially, ethnically, or otherwise objectionable, does not infringe upon any patent, trademark, copyright, trade secret, or other proprietary rights of any third party (this includes but is not limited to sports teams and licensed university logos or slogans), and does not otherwise violate any of the rights or other categories listed in our FAQs. All personalized orders are subject to review. If any of the above conditions are violated, the entire order will be canceled.',
        'confirm.body2': 'Once you submit your order, you cannot edit or modify it. Any changes to the imprint of your order must be made before the order ships.',
        'confirm.body3': 'Personalized items are non-refundable and cannot be canceled after you place your order. All sales of personalized products are final.',
        'confirm.body4': 'We do not offer personalization of our stainless steel drinkware or Yonder bottles.',
        'confirm.body5': 'If you need assistance ordering custom drinkware, for example, if you want to place an order for products with a trademarked or copyrighted image for which you have permission, or if you have any questions, please contact our Outfitter team before placing your order.',
        'confirm.body6': 'For company logos, please visit our Corporate Sales page for information and quotes.',
        'confirm.agreeLabel': 'I agree to these terms and conditions',
        'confirm.cancel': 'Cancel',
        'confirm.accept': 'Accept',

        // -- Upload confirmation modal ----------------------------------------
        'uploadConfirm.heading': 'In order to proceed, please review and accept the following:',
        'uploadConfirm.body1': 'Befit Coolers, LLC ("Befit", "Our") provides our customizer services to you through our website(s) located at Befit.com (the "Site") and related technologies (the "Service"). As a condition to the access and use of the Service you agree to the terms and conditions below:',
        'uploadConfirm.repWarrantiesHeading': 'Representation and Warranties',
        'uploadConfirm.repWarrantiesBody': 'You represent and warrant that you: a) are of legal age to enter and agree to these terms and conditions; b) if you are using the Services on behalf of a company or other organization, then you are entering into this agreement on behalf of yourself and such organization, and you represent that you have the legal authority to bind such organization to these terms of service; c) you are solely responsible for, images, information, photographs, graphics, messages, and other materials ("content") that you make available to Befit by uploading, posting, publishing, or displaying via the Service (collectively, "User Content"); d) you own all right, title and interest in and to such User Content; e) the User Content is not unlawful, harmful, threatening, tortious, defamatory, vulgar, obscene, libelous, invasive of another\'s privacy, hateful, or racially, ethnically or otherwise objectionable, is not connected to any political affiliations, associations or candidates, does not infringe on any patent, trademark, copyright, trade secret, or other proprietary rights of any third party (this includes, but is not limited to, sport teams and collegiate licensed logos or phrases), and does not otherwise violate anyone\'s rights or other categories listed in our FAQ.',
        'uploadConfirm.liabilityHeading': 'Limitation of Liability',
        'uploadConfirm.liabilityBody': 'You expressly understand and agree that Befit will not be liable for any indirect, incidental, special, consequential, exemplary damages, or damages for loss of profits including damages for loss of goodwill, use, or other intangible losses (even if Befit has been advised of the possibility of such damages), whether based on contract, tort, negligence, strict liability, or otherwise, resulting from: (a) the products or the use or the inability to use the service; or (b) the user content. Some jurisdictions do not allow the limitation or exclusion of liability for incidental or consequential damages, so some of the above may not apply to you. In such jurisdictions, liability is limited to the fullest extent permitted by law.',
        'uploadConfirm.indemnificationHeading': 'Indemnification',
        'uploadConfirm.indemnificationBody': 'You agree to defend, indemnify, and hold harmless Befit, its affiliates, and its and their respective officers, employees, directors, service providers, licensors, and agents (collectively, the "Befit Parties") from any and all losses, damages, expenses, including reasonable attorneys\' fees, rights, claims, actions of any kind, and injury arising out of or relating to your use of the Service, any User Content, your connection to the Service, your violation of these this agreement, or your violation of any rights of another.',
        'uploadConfirm.agreeLabel': 'I agree to these terms and conditions',
        'uploadConfirm.cancel': 'Cancel',
        'uploadConfirm.submit': 'Submit',

        // -- MiniNav ----------------------------------------------------------
        'miniNav.upload': 'UPLOAD',
        'miniNav.text': 'TEXT',
        'miniNav.monogram': 'MONOGRAM',
        'miniNav.gallery': 'GALLERY',

        // -- BottlePreview alt ------------------------------------------------
        'bottlePreview.alt': 'Yeti Bottle {side}',
        'bottlePreview.uploadedImageAlt': 'Uploaded image',

        // -- Loader -----------------------------------------------------------
        'loader.preparingDesign': 'Preparing your design...',
    },

    // =========================================================================
    // DUTCH (Nederlands)
    // =========================================================================
    nl: {
        // -- Tabs / Navigation ------------------------------------------------
        'tab.front': 'VOORKANT',
        'tab.back': 'ACHTERKANT',

        // -- Product info -----------------------------------------------------
        'product.heading': 'RAMBLER® 16 OZ REISFLES',
        'product.colorLabel': 'PRODUCTKLEUR:',
        'product.colorLabelShort': 'KLEUR:',

        // -- Color names ------------------------------------------------------
        'color.black': 'ZWART',
        'color.white': 'WIT',
        'color.blue': 'BLAUW',
        'color.red': 'ROOD',
        'color.selectAria': 'Selecteer kleur {color}',
        'color.update': 'BIJWERKEN',

        // -- Main view --------------------------------------------------------
        'main.heading': 'PERSONALISEER OP JOUW MANIER',
        'main.uploadOwn': 'UPLOAD JE EIGEN AFBEELDING',
        'main.text': 'TEKST',
        'main.monogram': 'MONOGRAM',
        'main.valentines': 'VALENTIJNSONTWERPEN',
        'main.gallery': 'GALERIJ',

        // -- Bottom bar -------------------------------------------------------
        'bottomBar.remove': 'VERWIJDEREN',
        'bottomBar.review': 'BEKIJKEN',
        'bottomBar.preparing': 'VOORBEREIDEN...',

        // -- Text view --------------------------------------------------------
        'text.back': 'TERUG',
        'text.placeholder': 'TYP HIER TEKST',
        'text.orientationLabel': 'Oriëntatie:',
        'text.vertical': 'Verticaal',
        'text.horizontal': 'Horizontaal',
        'text.verticalAria': 'Verticale tekst',
        'text.horizontalAria': 'Horizontale tekst',

        // -- Monogram view ----------------------------------------------------
        'monogram.back': 'TERUG',
        'monogram.placeholderSingle': 'SLECHTS ÉÉN LETTER',
        'monogram.placeholderMinTwo': 'MINIMAAL 2 LETTERS',
        'monogram.placeholderDefault': 'VOER JE INITIALEN IN',
        'monogram.warnSingleLetter': 'ALLEEN DE EERSTE LETTER WORDT GETOOND',
        'monogram.warnMinTwo': 'VOER MINIMAAL 2 LETTERS IN',
        'monogram.noteLabel': 'Opmerking:',
        'monogram.noteText': 'Monogrammen met drie initialen tonen de achternaam-initiaal in het midden.',

        // -- Gallery view -----------------------------------------------------
        'gallery.back': 'TERUG',
        'gallery.backToCategories': 'TERUG NAAR CATEGORIEËN',
        'gallery.selectedLabel': 'GESELECTEERD: {name}',

        // -- Gallery categories -----------------------------------------------
        'gallery.cat.nature': 'NATUUR',
        'gallery.cat.animals': 'DIEREN',
        'gallery.cat.symbols': 'SYMBOLEN',
        'gallery.cat.celebration': 'FEEST',
        'gallery.cat.family': 'FAMILIE',
        'gallery.cat.fan_favorites': 'FAVORIETEN',
        'gallery.cat.valentines': 'VALENTIJN',
        'gallery.cat.zodiac': 'STERRENBEELD',

        // -- Upload view ------------------------------------------------------
        'upload.back': '{side}',
        'upload.uploadFailed': 'Upload mislukt',
        'upload.errorPdf': 'Kan PDF-voorbeeld niet weergeven. Het bestand is mogelijk beschadigd of beveiligd met een wachtwoord.',
        'upload.errorAspectRatio': 'De beeldverhouding ({ratio}) valt buiten het toegestane bereik. Gebruik een afbeelding die dichter bij vierkant is (tussen 2:3 en 3:2).',
        'upload.errorLoadImage': 'Kan afbeelding niet laden. Controleer het bestand.',
        'upload.errorProcessing': 'Fout bij het verwerken van het bestand.',
        'upload.processing': 'Verwerken...',
        'upload.uploadDesign': 'ONTWERP UPLOADEN',
        'upload.acceptedTypes': 'Toegestane bestandstypen: PNG, JPG, SVG en PDF',
        'upload.iconImageSize': 'Afbeelding moet\n300 px zijn (B of H)',
        'upload.iconNoTrademark': 'Geen inbreuk op handelsmerken',
        'upload.iconNoCopyright': 'Geen inbreuk op auteursrechten',
        'upload.iconNoPhotos': "Geen foto's",
        'upload.instructionsHeading': 'INSTRUCTIES',
        'upload.instruction1': 'Bestellingen met aanstootgevende, ongepaste of auteursrechtelijk beschermde inhoud kunnen zonder verdere kennisgeving worden geannuleerd.',
        'upload.instruction2': 'Controleer je voorbeeld zorgvuldig: kijk of er ongewenste lijnen of vlekken zijn en snijd deze bij.',
        'upload.instruction3': 'Voor het beste resultaat begin je met een schets op wit papier met een dikke donkere stift. Houd het simpel en maak een foto in een goed verlichte ruimte zonder schaduwen.',
        'upload.instruction4': "Foto's worden omgezet naar zwart-wit en het resultaat kan variëren. Gebruik afbeeldingen met hoog contrast voor optimale graveerkwaliteit.",
        'upload.sizeLabel': 'GROOTTE',
        'upload.removeImage': 'Afbeelding verwijderen',
        'upload.placementHint': 'Bekijk de plaatsing op het flesvoorbeeld aan de linkerkant.',
        'upload.previewAlt': 'Voorbeeld',

        // -- Review screen ----------------------------------------------------
        'review.addingToCart': 'Wordt toegevoegd aan winkelwagen...',
        'review.logoAlt': 'Logo',
        'review.frontPreviewAlt': 'Voorbeeld voorkant',
        'review.backPreviewAlt': 'Voorbeeld achterkant',
        'review.closeAria': 'Beoordeling sluiten',
        'review.heading': 'Controleer je ontwerp',
        'review.deliveryNotice': 'Reken op 7 werkdagen voor personalisatie en 2-3 dagen voor levering. Leverdata kunnen niet worden gegarandeerd. ALLE AANKOPEN ZIJN DEFINITIEF.',
        'review.noPreview': 'Geen voorbeeld beschikbaar',
        'review.editFront': 'Voorkant bewerken',
        'review.editBack': 'Achterkant bewerken',
        'review.footerNotice': 'Controleer je spelling en ontwerp. Gepersonaliseerde producten kunnen niet worden geretourneerd.',
        'review.backButton': 'Terug',
        'review.addToCart': 'In winkelwagen',
        'review.adding': 'Toevoegen...',
        'review.errorDefault': 'Kon niet aan winkelwagen toevoegen. Probeer het opnieuw.',

        // -- Confirmation modal -----------------------------------------------
        'confirm.heading': 'Bevestig dit',
        'confirm.body1': 'De ingediende afbeelding en/of tekst is niet onwettig, schadelijk, bedreigend, onrechtmatig, lasterlijk, vulgair, obsceen, smadelijk, een inbreuk op de privacy van een ander, haatdragend, of racistisch, etnisch of anderszins aanstootgevend, maakt geen inbreuk op enig octrooi, handelsmerk, auteursrecht, bedrijfsgeheim of ander eigendomsrecht van een derde partij (dit omvat maar is niet beperkt tot sportteams en gelicentieerde universiteitslogo\'s of slogans), en schendt niet anderszins enig recht of andere categorieën vermeld in onze FAQ. Alle gepersonaliseerde bestellingen worden beoordeeld. Als een van de bovenstaande voorwaarden wordt geschonden, wordt de volledige bestelling geannuleerd.',
        'confirm.body2': 'Nadat je je bestelling hebt ingediend, kun je deze niet meer bewerken of wijzigen. Eventuele wijzigingen aan de opdruk van je bestelling moeten worden aangebracht voordat de bestelling wordt verzonden.',
        'confirm.body3': 'Gepersonaliseerde artikelen zijn niet-restitueerbaar en kunnen niet worden geannuleerd nadat je je bestelling hebt geplaatst. Alle verkopen van gepersonaliseerde producten zijn definitief.',
        'confirm.body4': 'Wij bieden geen personalisatie aan van onze roestvrijstalen drinkwaren of Yonder-flessen.',
        'confirm.body5': 'Als je hulp nodig hebt bij het bestellen van gepersonaliseerde drinkwaren, bijvoorbeeld als je een bestelling wilt plaatsen voor producten met een geregistreerd handelsmerk of auteursrechtelijk beschermde afbeelding waarvoor je toestemming hebt, of als je vragen hebt, neem dan contact op met ons Outfitter-team voordat je je bestelling plaatst.',
        'confirm.body6': 'Voor bedrijfslogo\'s kun je onze pagina Zakelijke Verkoop bezoeken voor informatie en offertes.',
        'confirm.agreeLabel': 'Ik ga akkoord met deze voorwaarden',
        'confirm.cancel': 'Annuleren',
        'confirm.accept': 'Accepteren',

        // -- Upload confirmation modal ----------------------------------------
        'uploadConfirm.heading': 'Om verder te gaan, lees en accepteer het volgende:',
        'uploadConfirm.body1': 'Befit Coolers, LLC ("Befit", "Ons") biedt onze configuratiediensten aan via onze website(s) op Befit.com (de "Site") en gerelateerde technologieën (de "Dienst"). Als voorwaarde voor toegang tot en gebruik van de Dienst ga je akkoord met de onderstaande voorwaarden:',
        'uploadConfirm.repWarrantiesHeading': 'Verklaringen en garanties',
        'uploadConfirm.repWarrantiesBody': 'Je verklaart en garandeert dat je: a) de wettelijke leeftijd hebt om deze voorwaarden te aanvaarden; b) als je de Diensten namens een bedrijf of andere organisatie gebruikt, je deze overeenkomst aangaat namens jezelf en die organisatie, en je verklaart dat je de wettelijke bevoegdheid hebt om die organisatie aan deze servicevoorwaarden te binden; c) je bent als enige verantwoordelijk voor afbeeldingen, informatie, foto\'s, grafische elementen, berichten en andere materialen ("inhoud") die je beschikbaar stelt aan Befit door te uploaden, posten, publiceren of weer te geven via de Dienst (gezamenlijk "Gebruikersinhoud"); d) je bezit alle rechten, titels en belangen in en op dergelijke Gebruikersinhoud; e) de Gebruikersinhoud is niet onwettig, schadelijk, bedreigend, onrechtmatig, lasterlijk, vulgair, obsceen, smadelijk, een inbreuk op de privacy van een ander, haatdragend, of racistisch, etnisch of anderszins aanstootgevend, is niet verbonden met politieke affiliaties, verenigingen of kandidaten, maakt geen inbreuk op enig octrooi, handelsmerk, auteursrecht, bedrijfsgeheim of ander eigendomsrecht van een derde partij (dit omvat maar is niet beperkt tot sportteams en universitair gelicentieerde logo\'s of uitdrukkingen), en schendt niet anderszins de rechten van anderen of andere categorieën vermeld in onze FAQ.',
        'uploadConfirm.liabilityHeading': 'Beperking van aansprakelijkheid',
        'uploadConfirm.liabilityBody': 'Je begrijpt en gaat er uitdrukkelijk mee akkoord dat Befit niet aansprakelijk is voor indirecte, incidentele, speciale, gevolgschade, exemplarische schade of schade door winstderving, inclusief schade door verlies van goodwill, gebruik of andere immateriële verliezen (zelfs als Befit op de hoogte is gesteld van de mogelijkheid van dergelijke schade), ongeacht of deze is gebaseerd op contract, onrechtmatige daad, nalatigheid, strikte aansprakelijkheid of anderszins, voortvloeiend uit: (a) de producten of het gebruik of het onvermogen om de dienst te gebruiken; of (b) de gebruikersinhoud. Sommige rechtsgebieden staan de beperking of uitsluiting van aansprakelijkheid voor incidentele schade of gevolgschade niet toe, dus sommige van het bovenstaande is mogelijk niet op jou van toepassing. In dergelijke rechtsgebieden is de aansprakelijkheid beperkt tot het maximaal wettelijk toegestane.',
        'uploadConfirm.indemnificationHeading': 'Vrijwaring',
        'uploadConfirm.indemnificationBody': 'Je gaat ermee akkoord Befit, haar gelieerde ondernemingen en hun respectievelijke functionarissen, werknemers, directeuren, dienstverleners, licentiegevers en agenten (gezamenlijk de "Befit-partijen") te verdedigen, schadeloos te stellen en te vrijwaren tegen alle verliezen, schade, kosten, inclusief redelijke advocaatkosten, rechten, claims, acties van welke aard dan ook, en letsel voortvloeiend uit of verband houdend met jouw gebruik van de Dienst, enige Gebruikersinhoud, jouw verbinding met de Dienst, jouw schending van deze overeenkomst, of jouw schending van enig recht van een ander.',
        'uploadConfirm.agreeLabel': 'Ik ga akkoord met deze voorwaarden',
        'uploadConfirm.cancel': 'Annuleren',
        'uploadConfirm.submit': 'Verzenden',

        // -- MiniNav ----------------------------------------------------------
        'miniNav.upload': 'UPLOADEN',
        'miniNav.text': 'TEKST',
        'miniNav.monogram': 'MONOGRAM',
        'miniNav.gallery': 'GALERIJ',

        // -- BottlePreview alt ------------------------------------------------
        'bottlePreview.alt': 'Yeti Fles {side}',
        'bottlePreview.uploadedImageAlt': 'Geüploade afbeelding',

        // -- Loader -----------------------------------------------------------
        'loader.preparingDesign': 'Je ontwerp wordt voorbereid...',
    }
};

export default translations;
