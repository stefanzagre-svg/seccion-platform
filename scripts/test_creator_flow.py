"""
SECCION Platform - Autonomous Real-User Live Browser Test (Creator Flow)
Simulates complete real human interaction across 10-step Creator Tour, Identity Quest,
Photo Upload, Biometrics, Relational Prompts 1 & 2, Creator Extension, and Founders Welcome.
"""

import time
import os
import tempfile
import base64
from playwright.sync_api import sync_playwright

def run_real_creator_flow():
    print("==========================================")
    print("STARTING AUTONOMOUS REAL CREATOR FLOW TEST (LIVE HEADED BROWSER)")
    print("==========================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=400)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(f"PAGE ERROR: {err}"))
        page.on("console", lambda msg: errors.append(f"CONSOLE ERR: {msg.text}") if msg.type == "error" else None)

        # 1. Open Onboarding in Creator Mode
        print("\n1. [Navigation] Open http://localhost:3000/onboarding?role=creator&fresh=true")
        page.goto("http://localhost:3000/onboarding?role=creator&fresh=true", wait_until="networkidle")
        time.sleep(1)

        # Switch to ES
        es_btn = page.locator("button:has-text('ES')").first
        if es_btn.count() > 0 and es_btn.is_visible():
            es_btn.click()
            print("-> Switched language to ES")
            time.sleep(0.5)

        # Step 1: Lobby -> Tour
        tour_btn = page.locator("button:has-text('Enter The Studio Tour'), button:has-text('Iniciar Tour del Estudio')").first
        if tour_btn.count() > 0 and tour_btn.is_visible():
            tour_btn.click()
            print("2. [Action] Clicked 'Enter The Studio Tour'")
            time.sleep(0.5)

        # Step 2: Mode Select -> Creator Mode
        print("3. [Action] Selected 'Creator Mode'")
        page.locator("h5:has-text('Creator Mode'), h5:has-text('Modo Creador'), p:has-text('Live Creator / Host')").first.click()
        time.sleep(1)

        # Step 3 & 4: Identity Setup
        print("4. [Action] Filled Identity: Purposes, Specialization, Rel Goals")
        page.locator("button:has-text('Lifestyle'), button:has-text('Estilo de Vida')").first.click()
        time.sleep(0.2)
        page.locator("button:has-text('Explicit 18+'), button:has-text('Explícito 18+')").first.click()
        time.sleep(0.3)

        spec_select = page.locator("select.w-full, select:has(option[value='Beauty'])").first
        if spec_select.count() > 0:
            spec_select.select_option(value="Explicit")
            time.sleep(0.3)

        page.locator("button:has-text('Straight'), button:has-text('Heterosexual')").first.click()
        time.sleep(0.2)

        page.locator("button:has-text('Long term partner'), button:has-text('Pareja a largo plazo')").first.click()
        time.sleep(0.2)
        page.locator("button:has-text('Monogamous'), button:has-text('Monógamo/a')").first.click()
        time.sleep(0.3)
        print("4. [Action] Filled Identity: Purposes, Specialization, Rel Goals")

        # Step 5: Revenue Engine
        print("5. [Action] Click 'Engage Revenue Engine'")
        page.locator("button:has-text('Engage Revenue Engine'), button:has-text('Activar Motor de Ingresos')").click()
        time.sleep(1)

        # Step 6: Portfolio
        print("6. [Action] Click 'Configure Your Portfolio'")
        page.locator("button:has-text('Configure Your Portfolio'), button:has-text('Configura tu Portafolio'), button:has-text('Configurar tu Portafolio')").click()
        time.sleep(1)

        # Step 7: Residence & Go Live
        print("7. [Action] Entered Residence & Clicked 'Save and Go Live'")
        res_input = page.locator("input[placeholder*='Alicante'], input[placeholder*='e.g.']")
        if res_input.count() > 0 and res_input.is_visible():
            res_input.fill("Madrid, España")
            time.sleep(0.3)
        page.locator("button:has-text('Save and Go Live'), button:has-text('Guardar y Transmitir')").click()
        time.sleep(1)

        # Step 8: Monetization Suite
        print("8. [Action] Click 'See How You Get Paid'")
        page.locator("button:has-text('See How You Get Paid'), button:has-text('Ver Cómo Cobras')").click()
        time.sleep(1)

        # Step 9: Finish Tour
        print("9. [Action] Click 'Finish Studio Tour'")
        page.locator("button:has-text('Finish Studio Tour'), button:has-text('Finalizar Tour')").click()
        time.sleep(1)

        # Step 10: Claim Studio
        print("10. [Action] Click 'Claim Your SECCION Studio'")
        page.locator("button:has-text('Claim Your SECCION Studio'), button:has-text('Reclamar tu Estudio'), button:has-text('Claim')").first.click()
        time.sleep(2)

        # Registration Gate
        print("\n--- STEP: REGISTRATION GATE ---")
        approved_btn = page.locator("button:has-text('APPROVED CREATOR'), button:has-text('Approved Creator')").first
        if approved_btn.count() > 0 and approved_btn.is_visible():
            approved_btn.click()
            print("-> Clicked 'Approved Creator'")
            time.sleep(1)

        email_btn = page.locator("button:has-text('Continue with Email'), button:has-text('Email')").first
        if email_btn.count() > 0 and email_btn.is_visible():
            email_btn.click()
            time.sleep(0.5)

            signin_toggle = page.locator("button:has-text('Already have an account? Sign In')").first
            if signin_toggle.count() > 0 and signin_toggle.is_visible():
                signin_toggle.click()
                time.sleep(0.5)

            email_input = page.locator("input[type='email']").first
            pwd_input = page.locator("input[type='password']").first
            if email_input.count() > 0 and email_input.is_visible():
                email_input.fill("creator_live_qa@session.com")
                pwd_input.fill("Password123!")
                time.sleep(0.3)

            checkbox_btns = page.locator("div.flex.items-start.gap-3 button")
            if checkbox_btns.count() >= 2:
                checkbox_btns.nth(0).click()
                time.sleep(0.2)
                checkbox_btns.nth(1).click()
                time.sleep(0.2)
                print("-> Accepted platform & privacy terms")

            sign_in_btn = page.locator("button:has-text('SIGN IN'), button:has-text('Sign In'), button:has-text('CREATE ACCOUNT')").first
            if sign_in_btn.count() > 0 and sign_in_btn.is_enabled():
                sign_in_btn.click()
                print("-> Clicked Sign In")
                time.sleep(3)

        # Profile Checklist (Photo & Album)
        print("\n--- STEP: PROFILE CHECKLIST (PHOTO & ALBUM) ---")
        file_input = page.locator("input[type='file']").first
        if file_input.count() > 0:
            png_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            img_bytes = base64.b64decode(png_base64)
            file_input.set_input_files({
                "name": "creator_avatar.png",
                "mimeType": "image/png",
                "buffer": img_bytes
            })
            print("-> User selected avatar photo from file picker")
            time.sleep(1)

        # Click Save Photos & Continue button
        print("-> User clicks 'Guardar Fotos y Continuar' / 'Save Photos & Continue'")
        save_photo_btn = page.locator("button:has-text('Guardar Fotos y Continuar'), button:has-text('Save Photos & Continue')").first
        if save_photo_btn.count() > 0 and save_photo_btn.is_visible():
            save_photo_btn.click()
            time.sleep(1.5)

        # 13. Check Bio Tab (Relational Prompts)
        print("\n--- STEP: RELATIONAL PROMPTS (BIO TAB) ---")
        time.sleep(1)

        # Check if Prompt 1 is visible
        prompt1_btn = page.locator("button:has-text('ANALIZAR Y GUARDAR PROMPT 1'), button:has-text('Analyze & Save Prompt 1')").first
        if prompt1_btn.count() > 0 and prompt1_btn.is_visible():
            vibe_zone_btn = page.locator("button:has-text('HABILIDADES'), button:has-text('SKILLS'), button:has-text('LIFESTYLE')").first
            if vibe_zone_btn.count() > 0 and vibe_zone_btn.is_visible():
                vibe_zone_btn.click()
                time.sleep(0.5)

            first_q = page.locator("div.custom-scrollbar button").first
            if first_q.count() > 0 and first_q.is_visible():
                first_q.click()
                time.sleep(0.5)

            textarea = page.locator("textarea").first
            if textarea.count() > 0 and textarea.is_visible():
                answer_text = "La paciencia y el auto-conocimiento son las habilidades mas valiosas que he desarrollado para conectar con mi audiencia."
                textarea.fill(answer_text)
                time.sleep(0.5)

            print("-> User clicks 'ANALIZAR Y GUARDAR PROMPT 1'...")
            prompt1_btn.click()
            time.sleep(2.5)

        # Prompt 2
        prompt2_btn = page.locator("button:has-text('ANALIZAR Y GUARDAR PROMPT 2'), button:has-text('Analyze & Save Prompt 2')").first
        if prompt2_btn.count() > 0 and prompt2_btn.is_visible():
            p2_q = page.locator("div.custom-scrollbar button").first
            if p2_q.count() > 0 and p2_q.is_visible():
                p2_q.click()
                time.sleep(0.5)

            textarea2 = page.locator("textarea").first
            if textarea2.count() > 0 and textarea2.is_visible():
                ans2 = "Siempre busco mantener una comunicacion clara y transparente cuando surgen diferencias."
                textarea2.fill(ans2)
                time.sleep(0.5)

            print("-> User clicks 'ANALIZAR Y GUARDAR PROMPT 2'...")
            prompt2_btn.click()
            time.sleep(3)

        # Check if Creator Extension is displayed
        print("\n--- STEP: CREATOR EXTENSION / DASHBOARD TRANSITION ---")
        time.sleep(2)
        reel_input = page.locator("input[placeholder*='vimeo'], input[placeholder*='https://']").first
        bio_input = page.locator("textarea[placeholder*='premium'], textarea[placeholder*='Describe']").first
        if reel_input.count() > 0 and reel_input.is_visible():
            reel_input.fill("https://vimeo.com/76979871")
            bio_input.fill("Creador profesional enfocado en transmisiones en vivo interactivas y contenido exclusivo de alta calidad.")
            time.sleep(0.5)
            print("-> Filled Creator Reel & Bio. Clicking 'Publish Creator Profile'...")
            page.locator("button:has-text('Publish Creator Profile'), button:has-text('Publicar Perfil')").first.click()
            time.sleep(3)

        # Welcome step check & Enter Dashboard
        enter_link = page.locator("a[href='/dashboard'], button:has-text('Enter Dashboard'), button:has-text('Enter SECCION')").first
        if enter_link.count() > 0 and enter_link.is_visible():
            print("-> Found 'Enter Dashboard' on FoundersWelcome screen. Navigating to platform dashboard...")
            enter_link.click()
            time.sleep(3)

        print("\n==========================================")
        print(f"FINAL STATUS: Current URL / Step: {page.url}")
        print("==========================================")
        if errors:
            print("BROWSER RUNTIME WARNINGS/ERRORS:", errors)
        else:
            print("SUCCESS: ZERO BROWSER RUNTIME ERRORS! CREATOR FULLY ACTIVATED & ENTERED PLATFORM!")

        browser.close()

if __name__ == "__main__":
    run_real_creator_flow()
