# Raya — Sakinah's AI companion (v1: scripted prompts, no AI API)
# Raya guides each step and offers gentle conversation prompts.
# Raya NEVER recommends an outcome or decides for the user.

RAYA_PROMPTS = {
    "match_opened": (
        "As-salamu alaykum. Alhamdulillah — you and this person have both chosen "
        "to open a conversation. Raya is here to help you get to know each other "
        "with honesty and care. There is no rush. Begin when you are ready."
    ),
    "topics": {
        "Parents & Family": [
            "What role does family play in your daily life?",
            "How do you imagine your relationship with your in-laws?",
            "What did your parents teach you about marriage?"
        ],
        "Work": [
            "How do you balance your work and personal life?",
            "What does your work mean to you beyond income?",
            "How would work change after marriage for you?"
        ],
        "Friends": [
            "What does friendship mean to you?",
            "How do your friends describe you?",
            "How do you imagine friendship within marriage?"
        ],
        "Habits": [
            "What does a typical day look like for you?",
            "What habits are you proud of? Any you are working to improve?",
            "Are you a morning person or a night person?"
        ],
        "Self-image": [
            "How would you describe yourself to someone who has never met you?",
            "What are your strengths? What do you find difficult?",
            "What does growth look like for you right now?"
        ],
        "Responsibility": [
            "How do you handle difficult decisions?",
            "What does taking responsibility mean to you in a marriage?",
            "How do you respond when things do not go as planned?"
        ],
        "Expectations": [
            "What are your hopes for marriage?",
            "What would a good day together look like for you?",
            "What is one thing you would never compromise on?"
        ],
        "Finances": [
            "How do you approach saving and spending?",
            "How do you imagine financial decisions being made together?",
            "What financial goals are important to you?"
        ]
    },
    "decision": {
        "proceed": (
            "Alhamdulillah. May Allah bless this step. Raya will help coordinate "
            "a family-present next step toward nikah, in sha Allah."
        ),
        "pause": (
            "Take all the time you need. Make istikhara, consult those you trust, "
            "and return when your heart is ready. There is no pressure here."
        ),
        "close": (
            "Jazak Allahu khayran for your honesty and care throughout this process. "
            "May Allah grant you a righteous spouse and ease your path. Ameen."
        )
    },
    "wali_invite": (
        "You may invite a wali — a trusted family member — to be present in this "
        "conversation. Their presence is a blessing, not a requirement. The choice "
        "is always yours."
    ),
    "topic_unlock": (
        "You have both explored this topic thoughtfully. The next topic is now open "
        "when you are ready."
    ),
    "topic_announcements": {
        "Work": (
            "A new chapter opens — how each of you finds meaning in your work says a lot "
            "about who you are 🌿"
        ),
        "Friends": (
            "The people we keep close reveal what we value. Take your time exploring this "
            "together 🤍"
        ),
        "Habits": (
            "The quiet rhythm of daily life shapes a home more than grand gestures. "
            "Explore this gently 🌿"
        ),
        "Self-image": (
            "How we see ourselves is often how we show up for others. Speak with honesty "
            "and kindness here 🤍"
        ),
        "Responsibility": (
            "A shared life is built on how each person shows up when it matters. "
            "Listen carefully to each other 🌿"
        ),
        "Expectations": (
            "What we hope for in a marriage tells the other person everything they need "
            "to know. Be honest and be gentle 🤍"
        ),
        "Finances": (
            "How we think about money in a shared life is a window into our values. "
            "There are no wrong answers here 🌿"
        ),
    }
}

def get_opening_message() -> str:
    """Returns Raya's first message when a match conversation opens."""
    return RAYA_PROMPTS["match_opened"]

def get_topic_prompts(topic: str) -> list[str]:
    """Returns Raya's gentle prompts for a given conversation topic."""
    return RAYA_PROMPTS["topics"].get(topic, [])

def get_decision_message(outcome: str) -> str:
    """Returns Raya's dignified message for each decision outcome."""
    return RAYA_PROMPTS["decision"].get(outcome, "")

def get_wali_invite_message() -> str:
    """Returns Raya's message when a wali is invited."""
    return RAYA_PROMPTS["wali_invite"]

def get_topic_unlock_message() -> str:
    """Returns Raya's message when a new topic unlocks."""
    return RAYA_PROMPTS["topic_unlock"]

def get_topic_announcement(topic: str) -> str:
    """Returns Raya's warm announcement message when a specific topic unlocks."""
    return RAYA_PROMPTS["topic_announcements"].get(topic, get_topic_unlock_message())

def get_ready_nudge_message(name: str) -> str:
    """Returns Raya's gentle message to the partner when one person signals ready."""
    return f"{name} feels ready to explore the next topic whenever you are 🤍 There's no rush."

def get_journey_complete_nudge_message(name: str) -> str:
    """Returns Raya's nudge when one person signals ready on the final topic."""
    return f"{name} feels ready to complete the journey whenever you are 🤍 There's no rush."

def get_all_topics() -> list[str]:
    """Returns the 8 pre-nikah topics in order. Intimacy is never in this list."""
    return list(RAYA_PROMPTS["topics"].keys())
