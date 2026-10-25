import type { Scenario } from "./types";

export const scenarios: Scenario[] = [
  {
    id: "coworker-break",
    title: "Break-time chat with a coworker",
    setting: "You are talking to a coworker during a break at the end of a long day.",
    level: "Beginner",
    steps: [
      {
        id: "coworker-break.1",
        speaker: "Ayşe",
        tr: "Bugün çok yoğundu, değil mi?",
        en: "Today was really busy, wasn't it?",
        options: [
          {
            tr: "Evet, çok yorucuydu. Kahve içelim mi?",
            en: "Yes, it was very tiring. Shall we have coffee?",
            fit: "best",
            why: "You agree, add your own feeling (yorucu = tiring) and suggest something. This keeps the conversation moving, which is how small talk works.",
          },
          {
            tr: "Evet.",
            en: "Yes.",
            fit: "good",
            why: "Correct, but very short. Turkish small talk usually adds a few words, otherwise it can sound cold.",
          },
          {
            tr: "Benim adım Mert.",
            en: "My name is Mert.",
            fit: "off",
            why: "Grammatically fine, but it does not answer her comment. You would use it when introducing yourself.",
          },
          {
            tr: "Afiyet olsun!",
            en: "Enjoy your meal!",
            fit: "off",
            why: "This is said to someone who is eating. It has nothing to do with a busy day.",
          },
        ],
      },
      {
        id: "coworker-break.2",
        speaker: "Ayşe",
        tr: "Yarınki toplantıya geliyor musun?",
        en: "Are you coming to tomorrow's meeting?",
        options: [
          {
            tr: "Evet, geliyorum. Saat kaçta?",
            en: "Yes, I'm coming. What time is it?",
            fit: "best",
            why: "A clear answer plus a useful follow-up question. Saat kaçta? (at what time?) is worth memorising.",
          },
          {
            tr: "Hayır, gelemem. Başka bir işim var.",
            en: "No, I can't come. I have other work.",
            fit: "good",
            why: "A natural, polite refusal. Gelemem means \"I can't come\", and it is clear and friendly.",
          },
          {
            tr: "Evet, geldim.",
            en: "Yes, I came.",
            fit: "off",
            why: "Geldim is the past tense (\"I came\"). The meeting is tomorrow, so use geliyorum (I'm coming).",
          },
          {
            tr: "Hoş buldum.",
            en: "Glad to be here.",
            fit: "off",
            why: "Hoş buldum answers Hoş geldin (welcome). It does not answer a question about a meeting.",
          },
        ],
      },
      {
        id: "coworker-break.3",
        speaker: "Ayşe",
        tr: "Ben çıkıyorum. İyi akşamlar!",
        en: "I'm leaving. Have a good evening!",
        options: [
          {
            tr: "İyi akşamlar, yarın görüşürüz!",
            en: "Good evening, see you tomorrow!",
            fit: "best",
            why: "You repeat the greeting and name the next time you will meet. This is a warm, natural goodbye.",
          },
          {
            tr: "Görüşürüz.",
            en: "See you.",
            fit: "good",
            why: "Fine and casual. It is a bit minimal, but nobody would mind.",
          },
          {
            tr: "Kolay gelsin!",
            en: "Hope work goes smoothly!",
            fit: "off",
            why: "Kolay gelsin is for people who are working. Ayşe is leaving, so it does not fit.",
          },
          {
            tr: "Günaydın!",
            en: "Good morning!",
            fit: "off",
            why: "Günaydın is a morning greeting; it is evening here.",
          },
        ],
      },
    ],
  },
  {
    id: "cafe-order",
    title: "Ordering at a café",
    setting: "You walk into a small café and a waiter comes to your table.",
    level: "Beginner",
    steps: [
      {
        id: "cafe-order.1",
        speaker: "Garson",
        tr: "Hoş geldiniz! Ne içersiniz?",
        en: "Welcome! What would you like to drink?",
        options: [
          {
            tr: "Hoş bulduk! Bir çay alabilir miyim?",
            en: "Thank you! Could I have a tea?",
            fit: "best",
            why: "Hoş bulduk is the traditional reply to Hoş geldiniz. Then you order politely with alabilir miyim.",
          },
          {
            tr: "Bir çay lütfen.",
            en: "A tea, please.",
            fit: "good",
            why: "Short and polite. Many Turkish people order exactly like this.",
          },
          {
            tr: "Çay.",
            en: "Tea.",
            fit: "off",
            why: "The meaning is clear, but one word with no lütfen can sound abrupt.",
          },
          {
            tr: "Elinize sağlık.",
            en: "Health to your hands.",
            fit: "off",
            why: "This thanks the cook after you eat. You have not eaten anything yet.",
          },
        ],
      },
      {
        id: "cafe-order.2",
        speaker: "Garson",
        tr: "Buyurun, çayınız. Afiyet olsun!",
        en: "Here is your tea. Enjoy!",
        options: [
          {
            tr: "Teşekkür ederim!",
            en: "Thank you!",
            fit: "best",
            why: "A simple thank-you is the natural reply.",
          },
          {
            tr: "Teşekkürler, size de.",
            en: "Thanks, you too.",
            fit: "good",
            why: "Size de means \"to you too\". It sounds friendly, though the waiter is not eating.",
          },
          {
            tr: "Geçmiş olsun.",
            en: "Get well soon.",
            fit: "off",
            why: "You say this to someone who is ill, not to a waiter.",
          },
          {
            tr: "Rica ederim.",
            en: "You're welcome.",
            fit: "off",
            why: "Rica ederim answers a thank-you. The waiter has not thanked you.",
          },
        ],
      },
      {
        id: "cafe-order.3",
        speaker: "Garson",
        tr: "Başka bir şey ister misiniz?",
        en: "Would you like anything else?",
        options: [
          {
            tr: "Hayır, teşekkürler. Hesap, lütfen.",
            en: "No, thank you. The bill, please.",
            fit: "best",
            why: "You decline politely and ask for the bill in one go.",
          },
          {
            tr: "Hesap, lütfen.",
            en: "The bill, please.",
            fit: "good",
            why: "Clear and polite. It is a little more direct without the first part.",
          },
          {
            tr: "Merhaba.",
            en: "Hello.",
            fit: "off",
            why: "You have already greeted each other. This does not answer his question.",
          },
          {
            tr: "Menüyü görebilir miyim?",
            en: "Could I see the menu?",
            fit: "off",
            why: "That is a reasonable request at the start, but it does not fit the end of your visit.",
          },
        ],
      },
    ],
  },
  {
    id: "professor-office",
    title: "Visiting your professor",
    setting: "You knock on your professor's office door after class.",
    level: "Beginner",
    steps: [
      {
        id: "professor-office.1",
        speaker: "Prof. Aydın",
        tr: "Buyurun, gelin.",
        en: "Please, come in.",
        options: [
          {
            tr: "Hocam, rahatsız ediyorum ama bir sorum olacaktı.",
            en: "Professor, sorry to bother you, but I had a question.",
            fit: "best",
            why: "Hocam is the respectful way to address a teacher, and the sentence opens politely.",
          },
          {
            tr: "Hocam, bir sorum var.",
            en: "Professor, I have a question.",
            fit: "good",
            why: "Direct and respectful enough, just less soft than the first option.",
          },
          {
            tr: "Naber hocam?",
            en: "What's up, professor?",
            fit: "off",
            why: "Naber? is too casual for a professor.",
          },
          {
            tr: "Ödevi bana anlat.",
            en: "Explain the homework to me.",
            fit: "off",
            why: "It is a command in the casual \"sen\" form. Never use that with a professor.",
          },
        ],
      },
      {
        id: "professor-office.2",
        speaker: "Prof. Aydın",
        tr: "Tabii, sorun.",
        en: "Of course, ask away.",
        options: [
          {
            tr: "Dünkü konuyu tam anlayamadım. Tekrar açıklar mısınız?",
            en: "I couldn't fully understand yesterday's topic. Could you explain it again?",
            fit: "best",
            why: "You say what the problem is and ask politely with the \"siz\" form (açıklar mısınız).",
          },
          {
            tr: "Anlamadım.",
            en: "I didn't understand.",
            fit: "good",
            why: "Understandable, but it gives no detail about what you didn't understand.",
          },
          {
            tr: "Konu çok kötü.",
            en: "The topic is very bad.",
            fit: "off",
            why: "This says the topic is bad, not that you are confused. It may sound rude.",
          },
          {
            tr: "Ben iyiyim, siz nasılsınız?",
            en: "I'm well, how are you?",
            fit: "off",
            why: "Nobody asked how you are. The professor asked you to ask your question.",
          },
        ],
      },
      {
        id: "professor-office.3",
        speaker: "Prof. Aydın",
        tr: "Şimdi anladınız mı?",
        en: "Do you understand now?",
        options: [
          {
            tr: "Evet, şimdi anladım. Çok teşekkür ederim hocam.",
            en: "Yes, now I understand. Thank you very much, professor.",
            fit: "best",
            why: "Confirms understanding and thanks the professor respectfully.",
          },
          {
            tr: "Evet, anladım. Sağ ol.",
            en: "Yes, I understand. Thanks.",
            fit: "good",
            why: "Sağ ol is the casual \"thanks\". It works, but Teşekkür ederim is better for a professor.",
          },
          {
            tr: "Hoş geldiniz!",
            en: "Welcome!",
            fit: "off",
            why: "Hoş geldiniz is said to someone arriving. It is not a reply to this question.",
          },
          {
            tr: "Afiyet olsun!",
            en: "Enjoy your meal!",
            fit: "off",
            why: "Said to someone who is eating; it doesn't fit here.",
          },
        ],
      },
    ],
  },
  {
    id: "street-directions",
    title: "Finding the metro",
    setting: "You are lost in a new neighbourhood and need to find the metro.",
    level: "Beginner",
    steps: [
      {
        id: "street-directions.1",
        speaker: "Passer-by",
        tr: "Buyurun, yardımcı olabilir miyim?",
        en: "Yes, can I help you?",
        options: [
          {
            tr: "Pardon, metro durağı nerede?",
            en: "Excuse me, where is the metro stop?",
            fit: "best",
            why: "Short, polite and exactly what you need. Pardon gets attention politely.",
          },
          {
            tr: "Merhaba, buralarda bir metro durağı var mı?",
            en: "Hello, is there a metro stop around here?",
            fit: "good",
            why: "Also natural. It asks if one exists nearby instead of asking where a particular stop is.",
          },
          {
            tr: "Metro nerede, söyle.",
            en: "Where is the metro, tell me.",
            fit: "off",
            why: "\"Söyle\" is a casual command. With a stranger it sounds rude.",
          },
          {
            tr: "Rica ederim.",
            en: "You're welcome.",
            fit: "off",
            why: "You use Rica ederim in answer to thanks. Nobody has thanked you.",
          },
        ],
      },
      {
        id: "street-directions.2",
        speaker: "Passer-by",
        tr: "Düz gidin, ikinci sokaktan sağa dönün.",
        en: "Go straight, then turn right at the second street.",
        options: [
          {
            tr: "Yürüyerek ne kadar sürer?",
            en: "How long does it take on foot?",
            fit: "best",
            why: "A useful follow-up question that helps you decide whether to walk.",
          },
          {
            tr: "Tamam, anladım. Teşekkürler!",
            en: "Okay, I understand. Thanks!",
            fit: "good",
            why: "A fine response if you've understood the directions. Tamam shows you got it.",
          },
          {
            tr: "Sola dönün.",
            en: "Turn left.",
            fit: "off",
            why: "This is you giving directions, and the wrong ones: sol is left, but the passer-by said sağ (right).",
          },
          {
            tr: "Hesap, lütfen.",
            en: "The bill, please.",
            fit: "off",
            why: "This is for restaurants, not for asking directions.",
          },
        ],
      },
      {
        id: "street-directions.3",
        speaker: "Passer-by",
        tr: "Yaklaşık beş dakika.",
        en: "About five minutes.",
        options: [
          {
            tr: "Çok teşekkürler, iyi günler!",
            en: "Thank you very much, have a nice day!",
            fit: "best",
            why: "Thank them and wish them well. A polite way to close the conversation.",
          },
          {
            tr: "Tamam, teşekkürler.",
            en: "Okay, thanks.",
            fit: "good",
            why: "Quick and friendly. Perfectly fine.",
          },
          {
            tr: "Rica ederim.",
            en: "You're welcome.",
            fit: "off",
            why: "They helped you, so you are the one who thanks.",
          },
          {
            tr: "Kayboldum galiba.",
            en: "I think I'm lost.",
            fit: "off",
            why: "You now know where to go, so this doesn't fit.",
          },
        ],
      },
    ],
  },
  {
    id: "clinic-booking",
    title: "Booking a doctor's visit",
    setting: "You call a clinic because you have been feeling unwell.",
    level: "Intermediate",
    steps: [
      {
        id: "clinic-booking.1",
        speaker: "Resepsiyon",
        tr: "Poliklinik, buyurun.",
        en: "Clinic, how can I help?",
        options: [
          {
            tr: "İyi günler, randevu almak istiyorum.",
            en: "Good day, I'd like to make an appointment.",
            fit: "best",
            why: "You greet politely and say clearly what you need.",
          },
          {
            tr: "Randevu almak istiyorum.",
            en: "I'd like to make an appointment.",
            fit: "good",
            why: "Clear, but starting with a greeting such as İyi günler is nicer.",
          },
          {
            tr: "Afiyet olsun!",
            en: "Enjoy your meal!",
            fit: "off",
            why: "This is said to people who are eating.",
          },
          {
            tr: "Hesap, lütfen.",
            en: "The bill, please.",
            fit: "off",
            why: "A restaurant phrase, not for booking an appointment.",
          },
        ],
      },
      {
        id: "clinic-booking.2",
        speaker: "Resepsiyon",
        tr: "Yarın saat on birde uygun mu?",
        en: "Is tomorrow at eleven suitable?",
        options: [
          {
            tr: "Evet, uygun. Teşekkür ederim.",
            en: "Yes, that works. Thank you.",
            fit: "best",
            why: "Uygun means \"suitable\" and answers the question directly.",
          },
          {
            tr: "Hayır, uygun değil. Öğleden sonra olabilir mi?",
            en: "No, that doesn't work. Could it be in the afternoon?",
            fit: "good",
            why: "A natural way to say the time is not good and ask for another. Öğleden sonra means afternoon.",
          },
          {
            tr: "Hoş geldiniz.",
            en: "Welcome.",
            fit: "off",
            why: "You are the one calling. This greeting doesn't answer a question.",
          },
          {
            tr: "Elinize sağlık.",
            en: "Health to your hands.",
            fit: "off",
            why: "This thanks a cook, and doesn't fit here.",
          },
        ],
      },
      {
        id: "clinic-booking.3",
        speaker: "Doktor",
        tr: "Şikâyetiniz nedir?",
        en: "What is your complaint?",
        options: [
          {
            tr: "Üç gündür başım ağrıyor ve ateşim var.",
            en: "My head has been hurting for three days and I have a fever.",
            fit: "best",
            why: "It gives the symptoms and how long they have lasted. That is exactly what a doctor needs.",
          },
          {
            tr: "Başım ağrıyor.",
            en: "I have a headache.",
            fit: "good",
            why: "Clear, but more detail helps the doctor.",
          },
          {
            tr: "Geçmiş olsun.",
            en: "Get well soon.",
            fit: "off",
            why: "You say this to a sick person. You are the patient here.",
          },
          {
            tr: "Randevu almak istiyorum.",
            en: "I'd like to make an appointment.",
            fit: "off",
            why: "You already have an appointment; you're in the doctor's office.",
          },
        ],
      },
    ],
  },
];
