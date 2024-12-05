// ==UserScript==
// @name         Chub AI Modern Design
// @namespace    VenusChub
// @version      v1.4
// @description  Moescape-like UI for Venus Tavern.
// @author       Pervertir
// @homepageURL  https://github.com/pervertir/Venus-Chub-Modern-Design
// @supportURL   https://github.com/pervertir/Venus-Chub-Modern-Design/issues
// @downloadURL  https://github.com/pervertir/Venus-Chub-Modern-Design/raw/main/VenusChubModernDesign.user.js
// @updateURL    https://github.com/pervertir/Venus-Chub-Modern-Design/raw/main/VenusChubModernDesign.user.js
// @match        https://chub.ai/*
// @grant        GM_addStyle
// @grant        GM_getResourceURL
// @grant        GM_xmlhttpRequest
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chub.ai
// @connect      *
// ==/UserScript==

(async function () {
    'use strict';

    GM_addStyle(`
        .ant-image {
            border-radius: 20% !important;
            overflow: hidden !important;
            object-fit: contian !important;
            position: top center;
        }

        .ant-list-item-meta {
            max-width: 95% !important;
            text-align: left;
        }

        .ant-list-item {
            border-radius: 0.5rem !important;
            margin-top: 0.8rem !important;
        }
    `);

    const selectors = {
        bgImage: "#root > div > div > div.ant-layout.sc-khjJXk.dLQnlF.chat-layout-bigbox.css-4aj7a5 > div:nth-child(1)",
        inputHolder: "form > div.d-flex.align-center",
        messageInput: "textarea.ant-input",
        chatArea: "div.no-scrollbar .ant-col-xs-24.ant-col-md-24.ant-col-lg-24",
        blankSpace: "div.ant-col-lg-5",
        expandedSpace: "#image-left",
        header: "#root > div > div > div.ant-layout.sc-dmXWDj.cBaqtx.chat-layout-bigbox.css-4aj7a5 > div.ant-row.ant-row-center.css-4aj7a5 > div",
        antLogo: "#root > div > div > div.ant-layout.sc-dmXWDj.cBaqtx.chat-layout-bigbox.css-4aj7a5 > div.ant-row.ant-row-center.css-4aj7a5 > div > span > div > span"
    };


    function waitForElement(selector, callback, ...args) {
        console.log(`Waiting for element:`, selector);
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`Element found:`, element);
                observer.disconnect();
                callback(element, ...args);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function modifyMessageInput(textarea) {
        textarea.setAttribute('placeholder', 'Message...');
        textarea.style.cssText = `
            font-size: 0.9rem;
            width: 30vw;
            height: 32px;
            max-height: 128px;
            line-height: 1.4rem;
            margin: 0.05rem;
            border-radius: 1.5rem;
            overflow: hidden;
        `;

        textarea.classList.add('align-center');
        textarea.addEventListener('input', function () {
            this.style.height = '32px'; // Reset height
            this.style.height = this.scrollHeight + 'px'; // Adjust height
        });
    }

    function modifyChatArea(div) {
        div.classList.replace('ant-col-lg-24', 'ant-col-lg-16');
        div.parentElement.style.marginTop = '10vh';
    }

    function expandLeft(div) {
        div.classList.replace('ant-col-lg-5', 'ant-col-lg-10');
        div.id = "image-left";
    }

    function shrinkRight(div) {
        div.classList.replace('ant-col-lg-5', 'ant-col-lg-2');
    }

    function spreadHeader(div) {
        div.style.cssText = `
            position: fixed;
            left: 50%;
            transform: translateX(-50%);
            right: 0;
            width: 80vw;
            z-index: 9999;
        `;
    }

    function disableLogo(span) {
        span.style.cssText = `
            pointer-events: none;
            display: none;
            cursor: not-allowed;
        `;
    }

    function centerInput(div) {
        div.classList.add('justify-center');
    }

    async function addCharacterImage(div, imageUrl) {
        if (!imageUrl) {
            console.warn("Image URL not provided.");
            return;
        }

        // Create an <img> element
        const img = document.createElement('img');
        img.src = imageUrl; // Set the source of the image
        img.style.cssText = `
        width: auto;
        height: 100%;
        object-fit: contain;
        border-radius: 10%;
    `;

        // Apply CSS styles to the div
        div.style.cssText = `
        position: relative;
        width: 90vw;
        height: 90vh;
        top: 7vh;
        left: 5vw;
        z-index: 9;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

        // Clear any existing content and add the <img> element to the div
        div.innerHTML = '';
        div.appendChild(img);
    }



    async function getBgURL(div) {
        const style = div.style.backgroundImage;
        div.style.filter = 'blur(3px)';

        const urlMatch = style.match(/url\(["']?([^"']+)["']?\)/);
        if (urlMatch) {
            const imageUrl = urlMatch[1];
            console.log(`Background image URL:`, imageUrl);

            waitForElement(selectors.expandedSpace, addCharacterImage, imageUrl);
        } else {
            console.warn("No background image found.");
        }
    }

    waitForElement(selectors.header, spreadHeader);
    waitForElement(selectors.antLogo, disableLogo);
    waitForElement(selectors.messageInput, modifyMessageInput);
    waitForElement(selectors.inputHolder, centerInput);
    waitForElement(selectors.blankSpace, expandLeft);
    waitForElement(selectors.blankSpace, shrinkRight);
    waitForElement(selectors.chatArea, modifyChatArea);
    waitForElement(selectors.bgImage, getBgURL);
})();
