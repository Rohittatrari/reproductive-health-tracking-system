import re
from typing import Dict, Any, List
from datetime import datetime
from app.config import settings

DISCLAIMER_TEXT = (
    "\n\n⚕️ Educational Medical Disclaimer: I am an AI Reproductive Health Educational Assistant. "
    "I provide general educational guidance and cannot diagnose medical conditions, provide formal clinical assessments, "
    "or prescribe treatments. For persistent pain, unusual bleeding, pregnancy confirmation, or medical concerns, "
    "please consult a qualified gynecologist or healthcare professional."
)

# Comprehensive verified clinical knowledge base for reproductive health queries
TOPIC_RESPONSES = [
    {
        "keywords": ["cramp", "dysmenorrhea", "period pain", "painful period"],
        "title": "Understanding Menstrual Cramps (Dysmenorrhea)",
        "content": (
            "Menstrual cramps (dysmenorrhea) are caused by uterine contractions triggered by hormone-like lipids called prostaglandins. "
            "Higher prostaglandin levels are associated with more severe menstrual cramps.\n\n"
            "Key Relief Strategies:\n"
            "• Heat therapy: A heating pad or warm bath increases blood flow and relaxes uterine muscles.\n"
            "• Gentle exercise: Walking, yoga, or light stretching releases endorphins (natural pain relievers).\n"
            "• Hydration: Drinking warm water reduces bloating and muscle tension.\n"
            "• Magnesium & Omega-3s: Found in leafy greens, nuts, and fish, which have anti-inflammatory properties.\n\n"
            "⚠️ When to see a doctor: If cramps are debilitating, interfere with daily activities, or do not respond to standard pain relief, "
            "it may indicate conditions like endometriosis, adenomyosis, or fibroids."
        )
    },
    {
        "keywords": ["fertile", "ovulation", "conception", "pregnant", "pregnancy chance", "fertile window"],
        "title": "Fertility Awareness & The Fertile Window",
        "content": (
            "The fertile window is the time in your menstrual cycle when conception is biologically possible.\n\n"
            "Key Physiological Facts:\n"
            "• Sperm survival: Sperm can live inside the female reproductive tract for up to 5 days under favorable cervical mucus conditions.\n"
            "• Ovum lifespan: Once an egg is released during ovulation, it survives for approximately 12 to 24 hours.\n"
            "• The window: Conception can occur from intercourse happening within the 5 days leading up to ovulation, plus the day of ovulation.\n"
            "• Peak fertility: Occurs during the 2 days before ovulation and the day of ovulation itself.\n\n"
            "⚠️ Contraceptive note: Natural cycle tracking involves natural biological variations due to illness, stress, or sleep. "
            "Fertility awareness estimates should never be relied upon as a foolproof method of contraception."
        )
    },
    {
        "keywords": ["pcos", "polycystic", "ovary syndrome", "irregular periods", "androgen"],
        "title": "Polycystic Ovary Syndrome (PCOS) Awareness",
        "content": (
            "Polycystic Ovary Syndrome (PCOS) is a common endocrine and metabolic condition affecting approximately 8–13% of women of reproductive age.\n\n"
            "Common Signs & Symptoms:\n"
            "• Irregular, infrequent, or absent periods (oligomenorrhea/amenorrhea)\n"
            "• Elevated androgen levels (excess facial/body hair, acne, or male-pattern baldness)\n"
            "• Polycystic ovarian appearance on ultrasound (multiple small immature follicles)\n"
            "• Insulin resistance and metabolic shifts\n\n"
            "Management Options:\n"
            "• Lifestyle: Low-glycemic nutrition, balanced protein, and regular resistance exercise help manage insulin sensitivity.\n"
            "• Clinical care: A gynecologist or endocrinologist may recommend hormonal therapies, cycle regulators, or metformin."
        )
    },
    {
        "keywords": ["endometriosis", "heavy bleeding", "pelvic pain", "pain during sex"],
        "title": "Endometriosis Awareness",
        "content": (
            "Endometriosis occurs when tissue similar to the lining of the uterus (endometrium) grows outside the uterus, "
            "such as on the ovaries, fallopian tubes, or outer surfaces of pelvic organs.\n\n"
            "Hallmark Symptoms:\n"
            "• Severe chronic pelvic pain, especially during menstruation (secondary dysmenorrhea)\n"
            "• Pain during or after sexual intercourse (dyspareunia)\n"
            "• Heavy menstrual bleeding (menorrhagia) or spotting between periods\n"
            "• Painful bowel movements or urination during menstruation\n"
            "• Fatigue and digestive upset\n\n"
            "Clinical evaluation by a specialized gynecologist is crucial for diagnosis (laparoscopy or high-resolution ultrasound/MRI) and symptom relief."
        )
    },
    {
        "keywords": ["pms", "premenstrual", "mood swing", "irritab", "bloat", "cravings"],
        "title": "Premenstrual Syndrome (PMS) & Hormonal Shifts",
        "content": (
            "Premenstrual Syndrome (PMS) occurs during the late luteal phase (1–2 weeks before your period) "
            "when estrogen and progesterone levels drop sharply after peak ovulation.\n\n"
            "Common Manifestations:\n"
            "• Emotional: Irritability, mood swings, anxiety, low energy, and food cravings (often for carbohydrates or sweets).\n"
            "• Physical: Abdominal bloating, breast tenderness, mild headaches, and temporary fluid retention.\n\n"
            "Helpful Self-Care Steps:\n"
            "• Reduce caffeine, excess salt, and alcohol 7 days before expected menstruation.\n"
            "• Prioritize 7–9 hours of sleep to stabilize cortisol and serotonin.\n"
            "• If symptoms severely disrupt work or relationships, discuss PMDD (Premenstrual Dysphoric Disorder) with your healthcare provider."
        )
    },
    {
        "keywords": ["hygiene", "pad", "tampon", "cup", "menstrual cup", "toxic shock", "tss"],
        "title": "Menstrual Hygiene & Safety",
        "content": (
            "Practicing safe menstrual hygiene protects against infections and promotes comfort.\n\n"
            "Best Practices:\n"
            "• Product Changes: Change sanitary pads every 4–6 hours; change tampons every 4–8 hours (never exceed 8 hours).\n"
            "• Menstrual Cups/Discs: Wash with gentle, fragrance-free soap every 8–12 hours, and sterilize in boiling water between cycles.\n"
            "• Cleansing: Wash only the external genital area (vulva) with warm water. Avoid internal vaginal douching, as the vagina is self-cleansing and douching disrupts natural lactobacilli and pH balance.\n"
            "• Toxic Shock Syndrome (TSS) Awareness: A rare but serious bacterial condition. Watch for sudden high fever, vomiting, diarrhea, sunburn-like rash, or fainting while using tampons."
        )
    },
    {
        "keywords": ["phases", "cycle phases", "follicular", "luteal", "menstrual cycle"],
        "title": "The Four Phases of the Menstrual Cycle",
        "content": (
            "The menstrual cycle consists of four continuous, orchestrated physiological phases:\n\n"
            "1. Menstrual Phase (Days 1–5): Shedding of the endometrium when pregnancy did not occur. Estrogen and progesterone are at their lowest.\n"
            "2. Follicular Phase (Days 1–13): Pituitary gland releases Follicle-Stimulating Hormone (FSH), stimulating ovarian follicles. Estrogen rises, rebuilding the uterine lining and boosting mood/energy.\n"
            "3. Ovulatory Phase (Around Day 14): Luteinizing Hormone (LH) surges, triggering the release of an egg from the dominant follicle into the fallopian tube.\n"
            "4. Luteal Phase (Days 15–28): The empty follicle becomes the corpus luteum, producing progesterone. If fertilization does not happen, the corpus luteum dissolves, hormone levels drop, triggering menstruation."
        )
    }
]

def generate_assistant_response(user_message: str) -> Dict[str, Any]:
    """
    Evaluates user message against verified clinical reproductive health knowledge base
    or forwards to AI service if configured. Always appends mandatory medical disclaimers.
    """
    clean_msg = user_message.lower().strip()

    # Rule-based expert clinical matching
    matched_topic = None
    for item in TOPIC_RESPONSES:
        if any(kw in clean_msg for kw in item["keywords"]):
            matched_topic = item
            break

    if matched_topic:
        response_text = f"### {matched_topic['title']}\n\n{matched_topic['content']}{DISCLAIMER_TEXT}"
    elif any(greeting in clean_msg for greeting in ["hello", "hi", "hey", "who are you", "help"]):
        response_text = (
            "Hello! I am your Reproductive Health Educational Assistant. 🌸\n\n"
            "I can assist you with verified educational information about:\n"
            "• The 4 menstrual cycle phases (Menstrual, Follicular, Ovulation, Luteal)\n"
            "• Period symptoms, cramps, and PMS management\n"
            "• Fertility awareness and estimating fertile windows\n"
            "• PCOS, Endometriosis, and hormonal health awareness\n"
            "• Menstrual hygiene and preventive wellness\n\n"
            "Feel free to ask any question!" + DISCLAIMER_TEXT
        )
    else:
        # Fallback educational guidance
        response_text = (
            f"Thank you for your question regarding **\"{user_message}\"**.\n\n"
            "Reproductive health involves a delicate balance of hormones (estrogen, progesterone, LH, FSH) "
            "that fluctuate throughout your monthly cycle. Tracking your cycle length, basal body temperature, "
            "cervical mucus changes, and daily physical or emotional symptoms provides valuable patterns for you "
            "and your physician.\n\n"
            "Key Preventive Recommendations:\n"
            "• Maintain a consistent sleep schedule to support hypothalamic-pituitary-ovarian axis regulation.\n"
            "• Keep a record of symptom severity and duration in your dashboard.\n"
            "• If you have specific medical symptoms or pain, scheduling a consultation with an OB/GYN is always recommended."
            + DISCLAIMER_TEXT
        )

    return {
        "message": response_text,
        "disclaimer_included": True,
        "timestamp": datetime.utcnow()
    }
