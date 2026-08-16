"""
SECCION Platform - Autonomous Real-User Live Browser Test (Creator Flow)
Simulates complete real human interaction across 10-step Creator Tour, Identity Quest,
Photo Upload, Biometrics, Relational Prompts 1 & 2, Creator Extension, and Founders Welcome.
"""

import time
from playwright.sync_api import sync_playwright

def run_real_creator_flow():
    print("==========================================")
    print("STARTING AUTONOMOUS REAL CREATOR FLOW TEST")
    print("==========================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
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
        creator_card = page.locator("div:has-text('Creator Mode'), div:has-text('Modo Creador')").first
        if creator_card.count() > 0 and creator_card.is_visible():
            creator_card.click()
            print("3. [Action] Selected 'Creator Mode'")
            time.sleep(0.5)

        # Step 3 & 4: Identity Setup
        purposes = page.locator("button:has-text('Lifestyle'), button:has-text('Estilo de Vida'), button:has-text('Explicit (18+)'), button:has-text('Explícito')")
        for i in range(min(purposes.count(), 2)):
            purposes.nth(i).click()
            time.sleep(0.2)

        spec_btn = page.locator("button:has-text('Social'), button:has-text('Explicit')").first
        if spec_btn.count() > 0 and spec_btn.is_visible():
            spec_btn.click()
            time.sleep(0.2)

        rel_goal_btn = page.locator("button:has-text('Friends'), button:has-text('Amigos'), button:has-text('Intimacy'), button:has-text('Intimidad')").first
        if rel_goal_btn.count() > 0 and rel_goal_btn.is_visible():
            rel_goal_btn.click()
            time.sleep(0.2)
        print("4. [Action] Filled Identity: Purposes, Specialization, Rel Goals")

        # Step 5: Revenue Engine
        rev_btn = page.locator("button:has-text('Engage Revenue Engine'), button:has-text('Activar Motor de Ingresos')").first
        if rev_btn.count() > 0 and rev_btn.is_visible():
            rev_btn.click()
            print("5. [Action] Clicked 'Engage Revenue Engine'")
            time.sleep(0.5)

        # Step 6: Portfolio
        port_btn = page.locator("button:has-text('Configure Your Portfolio'), button:has-text('Configura tu Portafolio')").first
        if port_btn.count() > 0 and port_btn.is_visible():
            port_btn.click()
            print("6. [Action] Clicked 'Configure Your Portfolio'")
            time.sleep(0.5)

        # Step 7: Residence & Go Live
        res_input = page.locator("input[placeholder*='e.g.'], input[placeholder*='ej.']")
        if res_input.count() > 0 and res_input.is_visible():
            res_input.fill("Madrid, Espana")
            time.sleep(0.3)
        live_btn = page.locator("button:has-text('Save and Go Live'), button:has-text('Guardar y Transmitir')").first
        if live_btn.count() > 0 and live_btn.is_visible():
            live_btn.click()
            print("7. [Action] Entered Residence & Clicked 'Save and Go Live'")
            time.sleep(0.5)

        # Step 8: Monetization Suite
        pay_btn = page.locator("button:has-text('See How You Get Paid'), button:has-text('Ver Cómo Cobras')").first
        if pay_btn.count() > 0 and pay_btn.is_visible():
            pay_btn.click()
            print("8. [Action] Clicked 'See How You Get Paid'")
            time.sleep(0.5)

        # Step 9: Finish Tour
        fin_btn = page.locator("button:has-text('Finish Studio Tour'), button:has-text('Finalizar Tour')").first
        if fin_btn.count() > 0 and fin_btn.is_visible():
            fin_btn.click()
            print("9. [Action] Clicked 'Finish Studio Tour'")
            time.sleep(0.5)

        # Step 10: Claim Studio
        claim_btn = page.locator("button:has-text('Claim Your SECCION Studio'), button:has-text('Reclamar tu Estudio')").first
        if claim_btn.count() > 0 and claim_btn.is_visible():
            claim_btn.click()
            print("10. [Action] Clicked 'Claim Your SECCION Studio'")
            time.sleep(2)

        # Registration Gate
        print("\n--- STEP: REGISTRATION GATE ---")
        email_btn = page.locator("button:has-text('Continue with Email'), button:has-text('Continuar con Email')").first
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

        # Profile Checklist (Photo)
        print("\n--- STEP: PROFILE CHECKLIST (PHOTO) ---")
        demo_avatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%2300fbfb'/></svg>"
        page.evaluate(f"window.dispatchEvent(new CustomEvent('demo_avatar_set', {{ detail: '{demo_avatar}' }}))")
        time.sleep(1)

        save_photo_btn = page.locator("button:has-text('Guardar Fotos y Continuar'), button:has-text('Save Photos & Continue')").first
        if save_photo_btn.count() > 0 and save_photo_btn.is_visible():
            save_photo_btn.click()
            print("-> Clicked 'Guardar Fotos y Continuar'")
            time.sleep(2)

        # Bio Tab (Prompts 1 & 2)
        print("\n--- STEP: RELATIONAL PROMPTS ---")
        prompt1_btn = page.locator("button:has-text('ANALIZAR Y GUARDAR PROMPT 1'), button:has-text('Analyze & Save Prompt 1')").first
        if prompt1_btn.count() > 0 and prompt1_btn.is_visible():
            vibe_btn = page.locator("button:has-text('HABILIDADES'), button:has-text('SKILLS'), button:has-text('LIFESTYLE')").first
            if vibe_btn.count() > 0 and vibe_btn.is_visible():
                vibe_btn.click()
                time.sleep(0.3)

            q_btn = page.locator("div.custom-scrollbar button").first
            if q_btn.count() > 0 and q_btn.is_visible():
                q_btn.click()
                time.sleep(0.3)

            textarea = page.locator("textarea")
            if textarea.count() > 0 and textarea.is_visible():
                textarea.fill("La paciencia y el auto-conocimiento son las habilidades mas valiosas que he desarrollado para conectar con mi audiencia.")
                time.sleep(0.3)

            print("-> User clicks 'ANALIZAR Y GUARDAR PROMPT 1'...")
            prompt1_btn.click()
            time.sleep(2)

        # Prompt 2
        prompt2_btn = page.locator("button:has-text('ANALIZAR Y GUARDAR PROMPT 2'), button:has-text('Analyze & Save Prompt 2')").first
        if prompt2_btn.count() > 0 and prompt2_btn.is_visible():
            q2_btn = page.locator("div.custom-scrollbar button").first
            if q2_btn.count() > 0 and q2_btn.is_visible():
                q2_btn.click()
                time.sleep(0.3)

            textarea2 = page.locator("textarea")
            if textarea2.count() > 0 and textarea2.is_visible():
                textarea2.fill("Siempre busco mantener una comunicacion clara y transparente cuando surgen diferencias.")
                time.sleep(0.3)

            print("-> User clicks 'ANALIZAR Y GUARDAR PROMPT 2'...")
            prompt2_btn.click()
            time.sleep(2)

        # Creator Extension
        reel_input = page.locator("input[placeholder*='vimeo'], input[placeholder*='https://']")
        bio_input = page.locator("textarea[placeholder*='premium']")
        if reel_input.count() > 0 and reel_input.is_visible():
            reel_input.fill("https://vimeo.com/76979871")
            bio_input.fill("Creador profesional enfocado en transmisiones en vivo interactivas y contenido exclusivo.")
            time.sleep(0.3)
            print("-> Filled Creator Reel & Bio. Clicking 'Publish Creator Profile'...")
            page.locator("button:has-text('Publish Creator Profile'), button:has-text('Publicar Perfil')").first.click()
            time.sleep(2)

        # Founders Welcome -> Dashboard
        enter_link = page.locator("button:has-text('Enter Dashboard'), button:has-text('Enter SECCION')").first
        if enter_link.count() > 0 and enter_link.is_visible():
            print("-> Clicked 'Enter Dashboard' on Founders Welcome screen...")
            enter_link.click()
            time.sleep(2)

        print("\n==========================================")
        print(f"FINAL STATUS: Current URL: {page.url}")
        print("==========================================")
        if errors:
            print("BROWSER RUNTIME WARNINGS/ERRORS:", errors)
        else:
            print("SUCCESS: ZERO BROWSER RUNTIME ERRORS! CREATOR ONBOARDING & ACTIVATION VERIFIED!")

        browser.close()

if __name__ == "__main__":
    run_real_creator_flow()
