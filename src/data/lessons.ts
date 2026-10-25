import type { Lesson } from "./types";

export const lessons: Lesson[] = [
  {
    id: "coworker-chat",
    category: "work",
    title: "Chatting with coworkers",
    summary: "Greet colleagues and make easy small talk.",
    situation:
      "It is a busy morning at the office. You want to greet your coworkers, wish them a smooth day and suggest a short break.",
    minutes: 6,
    phrases: [
      {
        id: "coworker-chat.1",
        tr: "Günaydın!",
        en: "Good morning!",
        register: "neutral",
        usage:
          "Use it from when you wake up until late morning. It works with everyone, from friends to your manager.",
        example: { tr: "Günaydın! Nasılsın?", en: "Good morning! How are you?" },
      },
      {
        id: "coworker-chat.2",
        tr: "Nasılsın?",
        en: "How are you?",
        register: "casual",
        usage:
          "Use it with colleagues your age and with friends. With a boss or someone older, switch to the polite form: Nasılsınız?",
        example: { tr: "İyiyim, teşekkürler. Sen nasılsın?", en: "I'm well, thanks. And you?" },
      },
      {
        id: "coworker-chat.3",
        tr: "Kolay gelsin!",
        en: "Hope your work goes smoothly!",
        literal: "May it come easy.",
        register: "neutral",
        usage:
          "Say it to someone who is working: a colleague at their desk, a shop assistant, a cashier. The usual reply is Sağ ol (casual) or Teşekkürler.",
        example: { tr: "Kolay gelsin! — Sağ ol!", en: "Hope work goes well! — Thanks!" },
      },
      {
        id: "coworker-chat.4",
        tr: "Bugün çok yoğundu, değil mi?",
        en: "Today was really busy, wasn't it?",
        register: "neutral",
        usage:
          "Adding değil mi at the end works like \"isn't it?\" or \"wasn't it?\" in English. It invites the other person to agree, so it is a friendly small-talk opener.",
      },
      {
        id: "coworker-chat.5",
        tr: "Kahve molası verelim mi?",
        en: "Shall we take a coffee break?",
        register: "neutral",
        usage:
          "Mola vermek means \"to take a break\". The ending -elim mi means \"shall we…?\", which is how Turkish people make friendly suggestions.",
        example: { tr: "Olur, gidelim!", en: "Sure, let's go!" },
      },
      {
        id: "coworker-chat.6",
        tr: "Yarın görüşürüz.",
        en: "See you tomorrow.",
        register: "neutral",
        usage:
          "Görüşürüz means \"we will see each other\". Add yarın (tomorrow) to name the day. It is a normal goodbye to colleagues at the end of the day.",
        example: { tr: "İyi akşamlar! Yarın görüşürüz.", en: "Good evening! See you tomorrow." },
      },
    ],
    dialogue: [
      { speaker: "Ayşe", tr: "Günaydın Mert! Nasılsın?", en: "Good morning, Mert! How are you?" },
      { speaker: "Mert", tr: "Günaydın! İyiyim, sen nasılsın?", en: "Good morning! I'm fine, how are you?" },
      { speaker: "Ayşe", tr: "İyiyim, sağ ol. Bugün çok yoğun olacak galiba.", en: "Fine, thanks. I think today is going to be very busy." },
      { speaker: "Mert", tr: "Evet, toplantı var. Kolay gelsin!", en: "Yes, there is a meeting. Hope work goes smoothly!" },
      { speaker: "Ayşe", tr: "Sağ ol! Öğlen kahve molası verelim mi?", en: "Thanks! Shall we take a coffee break at noon?" },
      { speaker: "Mert", tr: "Olur!", en: "Sounds good!" },
    ],
    quiz: [
      {
        id: "coworker-chat.q1",
        prompt: "It is 3 p.m. and your colleague is busy typing at their desk. What do you say?",
        options: ["Kolay gelsin!", "Afiyet olsun!", "Hoş geldin!", "Günaydın!"],
        answer: 0,
        explanation:
          "Kolay gelsin is what you say to someone who is working. Afiyet olsun is for people eating, and Günaydın is a morning greeting.",
      },
      {
        id: "coworker-chat.q2",
        prompt: "What does değil mi add at the end of \"Bugün çok yoğundu, değil mi?\"",
        options: [
          "It turns the sentence into a tag question, like \"wasn't it?\"",
          "It makes the sentence negative.",
          "It means \"thank you\".",
          "It makes the sentence formal.",
        ],
        answer: 0,
        explanation:
          "Değil mi literally means \"isn't it?\". It asks the listener to agree and does not make the sentence negative.",
      },
      {
        id: "coworker-chat.q3",
        prompt: "Which sentence suggests taking a coffee break together?",
        options: ["Kahve molası verelim mi?", "Kahve molası verdim.", "Kahve molası değil.", "Kahve mola!"],
        answer: 0,
        explanation:
          "-elim mi is the \"shall we…?\" ending. Verdim means \"I gave/took\", which is about only you in the past.",
      },
    ],
  },
  {
    id: "not-understanding",
    category: "work",
    title: "When you don't understand",
    summary: "Ask people to repeat, slow down or explain a word.",
    situation:
      "Your manager gives you instructions quickly in Turkish and you miss part of it. You need to ask for clarification politely.",
    minutes: 6,
    phrases: [
      {
        id: "not-understanding.1",
        tr: "Anlamadım.",
        en: "I didn't understand.",
        register: "neutral",
        usage:
          "It is polite enough on its own. Put Pardon in front to sound softer: Pardon, anlamadım.",
        example: { tr: "Pardon, anlamadım.", en: "Sorry, I didn't understand." },
      },
      {
        id: "not-understanding.2",
        tr: "Tekrar eder misiniz?",
        en: "Could you repeat that?",
        register: "formal",
        usage:
          "The -iniz ending is the polite \"you\", ideal for managers and strangers. With a friend say Tekrar eder misin?",
      },
      {
        id: "not-understanding.3",
        tr: "Biraz daha yavaş konuşabilir misiniz?",
        en: "Could you speak a little more slowly?",
        register: "formal",
        usage:
          "Biraz daha means \"a bit more\" and yavaş means \"slow\". This is a very useful sentence for every learner.",
      },
      {
        id: "not-understanding.4",
        tr: "Bu ne demek?",
        en: "What does this mean?",
        register: "neutral",
        usage:
          "Put any word in front to ask about it: \"Hazır\" ne demek? means \"What does hazır mean?\" Ne demek literally means \"what does it say/mean?\".",
        example: { tr: "\"Hazır\" ne demek?", en: "What does \"hazır\" mean?" },
      },
      {
        id: "not-understanding.5",
        tr: "Yanlış anladım galiba.",
        en: "I think I misunderstood.",
        register: "neutral",
        usage:
          "Galiba means \"I guess / I think\" and softens a statement. Use it when you realise you got something wrong.",
      },
      {
        id: "not-understanding.6",
        tr: "Haklısınız.",
        en: "You're right.",
        register: "formal",
        usage:
          "Haklı means \"right (in an argument)\". With friends use Haklısın. It is not used for \"correct answer\" in a quiz.",
      },
    ],
    dialogue: [
      { speaker: "Mert", tr: "Elif Hanım, pardon, anlamadım. Tekrar eder misiniz?", en: "Elif Hanım, sorry, I didn't understand. Could you repeat that?" },
      { speaker: "Elif Hanım", tr: "Tabii. Rapor cuma gününe kadar hazır olmalı.", en: "Of course. The report must be ready by Friday." },
      { speaker: "Mert", tr: "Biraz daha yavaş konuşabilir misiniz? \"Hazır\" ne demek?", en: "Could you speak a little more slowly? What does \"hazır\" mean?" },
      { speaker: "Elif Hanım", tr: "\"Hazır\", İngilizcede \"ready\" demek.", en: "\"Hazır\" means \"ready\" in English." },
      { speaker: "Mert", tr: "Haa, şimdi anladım. Cuma günü hazır olacak.", en: "Ah, now I understand. It will be ready on Friday." },
    ],
    quiz: [
      {
        id: "not-understanding.q1",
        prompt: "You did not catch what your manager said. What is the politest way to ask?",
        options: ["Tekrar eder misiniz?", "Tekrar et!", "Anlamadım değil.", "Hayır."],
        answer: 0,
        explanation:
          "Tekrar eder misiniz? is a polite request. Tekrar et! is a command, and Anlamadım değil would mean \"it is not that I didn't understand\".",
      },
      {
        id: "not-understanding.q2",
        prompt: "What does \"Haklısınız\" mean?",
        options: ["You're right.", "You're welcome.", "You're late.", "Welcome!"],
        answer: 0,
        explanation: "Haklı means \"right\" in the sense of having a fair point.",
      },
      {
        id: "not-understanding.q3",
        prompt: "In \"Yanlış anladım galiba\", what does galiba do?",
        options: [
          "It softens the sentence: \"I think / I guess\".",
          "It makes it a question.",
          "It means \"yesterday\".",
          "It makes it negative.",
        ],
        answer: 0,
        explanation: "Galiba is a small word that adds \"I think\" and makes you sound less absolute.",
      },
    ],
  },
  {
    id: "campus-talk",
    category: "university",
    title: "Professors and classmates",
    summary: "Ask your professor a question and plan study time with classmates.",
    situation:
      "You are a student. You want to ask your professor about a topic and a deadline, then ask a classmate for lecture notes.",
    minutes: 7,
    phrases: [
      {
        id: "campus-talk.1",
        tr: "Hocam, bir sorum var.",
        en: "Professor, I have a question.",
        literal: "My teacher, I have a question.",
        register: "neutral",
        usage:
          "Hocam is the common respectful way to address a teacher or professor in Turkey. You use it instead of a name when speaking to them.",
      },
      {
        id: "campus-talk.2",
        tr: "Rahatsız ediyorum ama bir sorum olacaktı.",
        en: "Sorry to bother you, but I had a question.",
        register: "formal",
        usage:
          "A polite way to interrupt someone. \"Olacaktı\" (was going to be) sounds softer than \"var\" (there is).",
      },
      {
        id: "campus-talk.3",
        tr: "Ödevin son teslim tarihi ne zaman?",
        en: "When is the assignment deadline?",
        register: "neutral",
        usage:
          "Ödev is homework or an assignment, son teslim tarihi is the final submission date. Add \"hocam\" at the end when talking to a professor.",
        example: { tr: "Ödevin son teslim tarihi ne zaman, hocam?", en: "When is the assignment deadline, professor?" },
      },
      {
        id: "campus-talk.4",
        tr: "Konuyu tam anlayamadım.",
        en: "I couldn't fully understand the topic.",
        register: "neutral",
        usage:
          "Anlayamadım means \"I was not able to understand\". It sounds gentler than Anlamadım because it puts the difficulty on you, not on the explanation.",
      },
      {
        id: "campus-talk.5",
        tr: "Ders notlarını paylaşır mısın?",
        en: "Could you share the lecture notes?",
        register: "casual",
        usage:
          "Use sen forms (paylaşır mısın) with classmates. Do not use this with a professor; there you would say paylaşır mısınız.",
      },
      {
        id: "campus-talk.6",
        tr: "Birlikte çalışalım mı?",
        en: "Shall we study together?",
        register: "casual",
        usage:
          "Birlikte means \"together\" and çalışmak means both \"to work\" and \"to study\". -alım mı is again \"shall we?\".",
        example: { tr: "Olur, kütüphanede buluşalım.", en: "Sure, let's meet in the library." },
      },
    ],
    dialogue: [
      { speaker: "Mert", tr: "Hocam, rahatsız ediyorum ama bir sorum olacaktı.", en: "Professor, sorry to bother you, but I had a question." },
      { speaker: "Prof. Aydın", tr: "Tabii, buyurun.", en: "Of course, go ahead." },
      { speaker: "Mert", tr: "Ödevin son teslim tarihi ne zaman, hocam?", en: "When is the assignment deadline, professor?" },
      { speaker: "Prof. Aydın", tr: "Gelecek cuma.", en: "Next Friday." },
      { speaker: "Mert", tr: "Teşekkür ederim hocam.", en: "Thank you, professor." },
      { speaker: "Mert", tr: "Deniz, ders notlarını paylaşır mısın?", en: "Deniz, could you share the lecture notes?" },
      { speaker: "Deniz", tr: "Tabii! Birlikte çalışalım mı?", en: "Sure! Shall we study together?" },
      { speaker: "Mert", tr: "Olur!", en: "Sounds good!" },
    ],
    quiz: [
      {
        id: "campus-talk.q1",
        prompt: "You knock on your professor's door. Which opening is best?",
        options: [
          "Hocam, rahatsız ediyorum ama bir sorum olacaktı.",
          "Hey, bir sorum var.",
          "Naber hoca?",
          "Sen bana anlat.",
        ],
        answer: 0,
        explanation:
          "It is respectful and polite. The other options are too casual or blunt for a professor.",
      },
      {
        id: "campus-talk.q2",
        prompt: "What does \"Konuyu tam anlayamadım\" tell the professor?",
        options: [
          "I couldn't fully understand the topic.",
          "I don't like the topic.",
          "I will explain the topic.",
          "The topic is finished.",
        ],
        answer: 0,
        explanation: "Tam means \"fully\" and anlayamadım means \"I wasn't able to understand\".",
      },
      {
        id: "campus-talk.q3",
        prompt: "Which sentence means \"Shall we study together?\"",
        options: ["Birlikte çalışalım mı?", "Birlikte çalıştık.", "Çalışmak güzel.", "Ödev yok mu?"],
        answer: 0,
        explanation: "-alım mı is the \"shall we?\" ending, and birlikte means \"together\".",
      },
    ],
  },
  {
    id: "casual-greetings",
    category: "everyday",
    title: "Casual greetings and replies",
    summary: "Sound relaxed with friends: Naber? İyidir. Olur!",
    situation:
      "A friend invites you over. You greet each other casually, say welcome, and accept an offer of tea.",
    minutes: 5,
    phrases: [
      {
        id: "casual-greetings.1",
        tr: "Selam!",
        en: "Hi!",
        register: "casual",
        usage: "For friends and people your age. Do not use it with professors, older people or in formal emails.",
      },
      {
        id: "casual-greetings.2",
        tr: "Naber?",
        en: "What's up?",
        literal: "What news?",
        register: "casual",
        usage:
          "A short form of \"Ne haber?\". It is a friendly greeting, and people expect a short answer.",
      },
      {
        id: "casual-greetings.3",
        tr: "İyidir, senden naber?",
        en: "Good, what's up with you?",
        register: "casual",
        usage:
          "İyidir is the typical answer to Naber?. Senden naber? hands the question back to the other person.",
      },
      {
        id: "casual-greetings.4",
        tr: "Hoş geldin!",
        en: "Welcome!",
        register: "neutral",
        usage:
          "Say it when someone arrives at your home or place. The polite plural is Hoş geldiniz.",
      },
      {
        id: "casual-greetings.5",
        tr: "Hoş buldum.",
        en: "Thanks, glad to be here.",
        literal: "I found it pleasant.",
        register: "neutral",
        usage:
          "This is the set reply to Hoş geldin. If more than one person is welcomed, say Hoş bulduk.",
      },
      {
        id: "casual-greetings.6",
        tr: "Olur.",
        en: "Sounds good. / Okay, sure.",
        register: "casual",
        usage:
          "Use Olur to accept a suggestion or offer. Olmaz means \"no, that is not possible\". Tamam means \"okay, understood\".",
        example: { tr: "Çay içelim mi? — Olur!", en: "Shall we have tea? — Sure!" },
      },
      {
        id: "casual-greetings.7",
        tr: "Görüşürüz!",
        en: "See you!",
        register: "casual",
        usage: "A relaxed goodbye to someone you will probably see again.",
      },
    ],
    dialogue: [
      { speaker: "Deniz", tr: "Selam Mert! Naber?", en: "Hi Mert! What's up?" },
      { speaker: "Mert", tr: "İyidir, senden naber?", en: "Good, what's up with you?" },
      { speaker: "Deniz", tr: "İyidir. Hoş geldin, gir!", en: "Good. Welcome, come in!" },
      { speaker: "Mert", tr: "Hoş buldum!", en: "Thanks, glad to be here!" },
      { speaker: "Deniz", tr: "Çay içelim mi?", en: "Shall we have tea?" },
      { speaker: "Mert", tr: "Olur!", en: "Sure!" },
    ],
    quiz: [
      {
        id: "casual-greetings.q1",
        prompt: "A friend welcomes you with \"Hoş geldin!\". What do you answer?",
        options: ["Hoş buldum!", "Hoş geldin!", "Afiyet olsun!", "Geçmiş olsun!"],
        answer: 0,
        explanation: "Hoş buldum is the fixed reply to Hoş geldin.",
      },
      {
        id: "casual-greetings.q2",
        prompt: "A friend texts \"Naber?\". What is a natural reply?",
        options: ["İyidir, senden naber?", "Hoş buldum.", "Güle güle.", "Teşekkür ederim, rica ederim."],
        answer: 0,
        explanation: "İyidir answers the question and senden naber? returns it.",
      },
      {
        id: "casual-greetings.q3",
        prompt: "Your friend says \"Çay içelim mi?\" and you want to say yes.",
        options: ["Olur!", "Olmaz.", "Geçmiş olsun.", "Hoş buldum."],
        answer: 0,
        explanation: "Olur accepts. Olmaz means \"no / not possible\".",
      },
    ],
  },
  {
    id: "ordering-food",
    category: "shopping",
    title: "Ordering food and drinks",
    summary: "Order at a café, compliment the cook and pay the bill.",
    situation:
      "You are at a small restaurant. You ask for the menu, ask for a recommendation, order, and pay.",
    minutes: 7,
    phrases: [
      {
        id: "ordering-food.1",
        tr: "Menüyü görebilir miyim?",
        en: "Could I see the menu?",
        register: "neutral",
        usage: "Görebilir miyim means \"can I see?\". It is a polite way to ask for something.",
      },
      {
        id: "ordering-food.2",
        tr: "Ne önerirsiniz?",
        en: "What do you recommend?",
        register: "formal",
        usage:
          "Servers are happy to answer this one. It is a great way to try local dishes.",
        example: { tr: "Mantı çok güzel.", en: "The mantı (Turkish dumplings) is very good." },
      },
      {
        id: "ordering-food.3",
        tr: "Bir Türk kahvesi alabilir miyim?",
        en: "Could I have a Turkish coffee?",
        register: "neutral",
        usage:
          "Replace \"Türk kahvesi\" with anything: bir çay (a tea), bir su (a water). Lütfen (please) can be added at the end.",
      },
      {
        id: "ordering-food.4",
        tr: "Afiyet olsun!",
        en: "Enjoy your meal!",
        literal: "May it be good for your health.",
        register: "neutral",
        usage:
          "Said to people who are about to eat or are eating. A simple reply is Teşekkürler, or Size de (to you too).",
      },
      {
        id: "ordering-food.5",
        tr: "Elinize sağlık.",
        en: "Thanks to the cook, that was delicious.",
        literal: "Health to your hands.",
        register: "formal",
        usage:
          "Say it to whoever cooked, after a meal at someone's home or in a restaurant. The usual reply is Afiyet olsun or Sağ olun. With a close friend: Eline sağlık.",
        example: { tr: "Elinize sağlık, çok güzeldi.", en: "Thank you for cooking, it was lovely." },
      },
      {
        id: "ordering-food.6",
        tr: "Hesap, lütfen.",
        en: "The bill, please.",
        register: "neutral",
        usage: "Hesap is the bill or the check. Say it when you are ready to pay.",
      },
      {
        id: "ordering-food.7",
        tr: "Kartla ödeyebilir miyim?",
        en: "Can I pay by card?",
        register: "neutral",
        usage:
          "Kart is card; the ending -la means \"with\". For cash say Nakit ödeyebilir miyim?",
      },
    ],
    dialogue: [
      { speaker: "Garson", tr: "Hoş geldiniz! Buyurun.", en: "Welcome! Please, have a seat." },
      { speaker: "You", tr: "Hoş bulduk. Menüyü görebilir miyim?", en: "Thank you. Could I see the menu?" },
      { speaker: "Garson", tr: "Tabii, buyurun.", en: "Of course, here you go." },
      { speaker: "You", tr: "Ne önerirsiniz?", en: "What do you recommend?" },
      { speaker: "Garson", tr: "Mantı çok güzel.", en: "The mantı is very good." },
      { speaker: "You", tr: "O zaman bir mantı ve bir çay lütfen.", en: "Then one mantı and a tea, please." },
      { speaker: "Garson", tr: "Hemen getiriyorum. Afiyet olsun!", en: "I'll bring it right away. Enjoy your meal!" },
      { speaker: "You", tr: "Teşekkürler! Elinize sağlık, çok güzeldi. Hesap, lütfen.", en: "Thanks! Thank you for cooking, it was lovely. The bill, please." },
      { speaker: "You", tr: "Kartla ödeyebilir miyim?", en: "Can I pay by card?" },
      { speaker: "Garson", tr: "Tabii.", en: "Of course." },
    ],
    quiz: [
      {
        id: "ordering-food.q1",
        prompt: "You loved the meal your friend's mother cooked. What do you say to her?",
        options: ["Elinize sağlık!", "Geçmiş olsun!", "Kolay gelsin!", "Hoş geldiniz!"],
        answer: 0,
        explanation: "Elinize sağlık literally means \"health to your hands\" and thanks the cook.",
      },
      {
        id: "ordering-food.q2",
        prompt: "The waiter puts your food down and says \"Afiyet olsun!\". Best reply?",
        options: ["Teşekkürler!", "Geçmiş olsun.", "Hoş geldiniz!", "Hesap lütfen."],
        answer: 0,
        explanation: "A simple thank-you is the natural answer. Hesap lütfen is for the end of the meal.",
      },
      {
        id: "ordering-food.q3",
        prompt: "Which sentence asks whether you can pay by card?",
        options: ["Kartla ödeyebilir miyim?", "Menüyü görebilir miyim?", "Ne önerirsiniz?", "Hesap, lütfen."],
        answer: 0,
        explanation: "Hesap, lütfen asks for the bill; it does not say how you will pay.",
      },
    ],
  },
  {
    id: "new-friends",
    category: "social",
    title: "Meeting new people",
    summary: "Introduce yourself and keep a first conversation going.",
    situation:
      "You are at a friend's party and meet someone new. You introduce yourself, say where you are from, and suggest meeting again.",
    minutes: 7,
    phrases: [
      {
        id: "new-friends.1",
        tr: "Tanıştığımıza memnun oldum.",
        en: "Nice to meet you.",
        literal: "I am pleased that we met.",
        register: "neutral",
        usage:
          "Say it right after you are introduced. A common reply is Ben de (me too).",
      },
      {
        id: "new-friends.2",
        tr: "Adın ne?",
        en: "What's your name?",
        register: "casual",
        usage:
          "For people your age. With elders or in formal settings, use Adınız nedir? Answer with Benim adım Mert or just Ben Mert.",
      },
      {
        id: "new-friends.3",
        tr: "Nerelisin?",
        en: "Where are you from?",
        register: "casual",
        usage:
          "Very common in Turkey, and it can mean your country or your city. Answer with a place plus -lı/-li: Ben Kanadalıyım (I'm Canadian).",
      },
      {
        id: "new-friends.4",
        tr: "Ne iş yapıyorsun?",
        en: "What do you do for work?",
        register: "casual",
        usage: "Polite version: Ne iş yapıyorsunuz? A normal getting-to-know-you question.",
      },
      {
        id: "new-friends.5",
        tr: "Türkçe öğreniyorum.",
        en: "I'm learning Turkish.",
        register: "neutral",
        usage:
          "Tells people to speak a little slower and be patient. Add: Türkçem henüz çok iyi değil (my Turkish is not very good yet).",
      },
      {
        id: "new-friends.6",
        tr: "Türkçen çok iyi!",
        en: "Your Turkish is very good!",
        register: "casual",
        usage:
          "A kind compliment. Reply with Sağ ol! Hâlâ öğreniyorum (Thanks! I'm still learning).",
      },
      {
        id: "new-friends.7",
        tr: "Bir ara kahve içelim mi?",
        en: "Shall we get coffee sometime?",
        register: "casual",
        usage:
          "Bir ara means \"sometime\". It is a friendly, low-pressure way to suggest meeting again.",
      },
    ],
    dialogue: [
      { speaker: "Elif", tr: "Merhaba! Ben Elif. Adın ne?", en: "Hello! I'm Elif. What's your name?" },
      { speaker: "Mert", tr: "Merhaba Elif, ben Mert. Tanıştığımıza memnun oldum.", en: "Hello Elif, I'm Mert. Nice to meet you." },
      { speaker: "Elif", tr: "Ben de. Nerelisin?", en: "Me too. Where are you from?" },
      { speaker: "Mert", tr: "Kanadalıyım. Türkçe öğreniyorum.", en: "I'm Canadian. I'm learning Turkish." },
      { speaker: "Elif", tr: "Türkçen çok iyi!", en: "Your Turkish is very good!" },
      { speaker: "Mert", tr: "Sağ ol! Bir ara kahve içelim mi?", en: "Thanks! Shall we get coffee sometime?" },
      { speaker: "Elif", tr: "Olur, çok isterim!", en: "Sure, I'd love to!" },
    ],
    quiz: [
      {
        id: "new-friends.q1",
        prompt: "What does \"Nerelisin?\" ask?",
        options: ["Where are you from?", "What is your name?", "How old are you?", "What do you do?"],
        answer: 0,
        explanation: "Nere means \"where\"; -li adds the idea of origin.",
      },
      {
        id: "new-friends.q2",
        prompt: "Someone says \"Türkçen çok iyi!\". What is a natural reply?",
        options: ["Sağ ol! Hâlâ öğreniyorum.", "Rica ederim.", "Hoş buldum.", "Geçmiş olsun."],
        answer: 0,
        explanation: "You thank them and show humility. Rica ederim is a reply to thanks, not to compliments.",
      },
      {
        id: "new-friends.q3",
        prompt: "Which is the polite version of \"Adın ne?\" for an older person?",
        options: ["Adınız nedir?", "Adın ne?", "Nerelisin?", "Ne iş yapıyorsun?"],
        answer: 0,
        explanation: "-ınız is the polite \"your\". Adınız nedir? is suitable for strangers and elders.",
      },
    ],
  },
  {
    id: "directions",
    category: "help",
    title: "Asking for directions",
    summary: "Find a place, understand the answer and say thank you.",
    situation:
      "You are in an unfamiliar neighbourhood and need to find the metro. You stop a passer-by and ask for help.",
    minutes: 6,
    phrases: [
      {
        id: "directions.1",
        tr: "Pardon, metro durağı nerede?",
        en: "Excuse me, where is the metro stop?",
        register: "neutral",
        usage:
          "Start with Pardon to get attention politely. Replace \"metro durağı\" with any place: eczane (pharmacy), tuvalet (toilet), banka (bank).",
      },
      {
        id: "directions.2",
        tr: "Buralarda bir eczane var mı?",
        en: "Is there a pharmacy around here?",
        register: "neutral",
        usage: "Buralarda means \"around here\". Var mı? means \"is there?\".",
      },
      {
        id: "directions.3",
        tr: "Düz gidin, sonra sağa dönün.",
        en: "Go straight, then turn right.",
        register: "formal",
        usage:
          "You will hear this answer. Sola dönün is \"turn left\". These are polite commands using -in/-ın.",
      },
      {
        id: "directions.4",
        tr: "Yürüyerek ne kadar sürer?",
        en: "How long does it take on foot?",
        register: "neutral",
        usage:
          "Yürümek is to walk. Replace with Arabayla (by car) or Otobüsle (by bus).",
      },
      {
        id: "directions.5",
        tr: "Kayboldum galiba.",
        en: "I think I'm lost.",
        register: "neutral",
        usage: "Kaybolmak is to get lost; galiba softens it to \"I think\".",
      },
      {
        id: "directions.6",
        tr: "Yardım eder misiniz?",
        en: "Could you help me?",
        register: "formal",
        usage: "A polite way to ask a stranger for help, in any situation.",
      },
      {
        id: "directions.7",
        tr: "Rica ederim.",
        en: "You're welcome.",
        register: "neutral",
        usage:
          "This is the reply to Teşekkürler. Do not say it when you are the one thanking someone.",
      },
    ],
    dialogue: [
      { speaker: "You", tr: "Pardon, metro durağı nerede?", en: "Excuse me, where is the metro stop?" },
      { speaker: "Biri", tr: "Düz gidin, sonra sağa dönün.", en: "Go straight, then turn right." },
      { speaker: "You", tr: "Yürüyerek ne kadar sürer?", en: "How long does it take on foot?" },
      { speaker: "Biri", tr: "Beş dakika kadar.", en: "About five minutes." },
      { speaker: "You", tr: "Çok teşekkürler!", en: "Thank you very much!" },
      { speaker: "Biri", tr: "Rica ederim, iyi günler!", en: "You're welcome, have a nice day!" },
    ],
    quiz: [
      {
        id: "directions.q1",
        prompt: "What does \"Sağa dönün\" mean?",
        options: ["Turn right.", "Turn left.", "Go straight.", "Stop here."],
        answer: 0,
        explanation: "Sağ is right and sol is left. Dönün is the polite command \"turn\".",
      },
      {
        id: "directions.q2",
        prompt: "How do you ask if there is a pharmacy nearby?",
        options: [
          "Buralarda bir eczane var mı?",
          "Eczane nerede değil?",
          "Eczane ben var.",
          "Buralarda eczane yok.",
        ],
        answer: 0,
        explanation: "Var mı? asks \"is there?\". Yok means \"there isn't\".",
      },
      {
        id: "directions.q3",
        prompt: "A stranger thanks you: \"Çok teşekkürler!\". What do you answer?",
        options: ["Rica ederim.", "Pardon.", "Kayboldum.", "Düz gidin."],
        answer: 0,
        explanation: "Rica ederim means \"you're welcome\".",
      },
    ],
  },
  {
    id: "doctor-visit",
    category: "help",
    title: "At the doctor",
    summary: "Book an appointment and explain how you feel.",
    situation:
      "You are not feeling well. You phone a clinic to make an appointment and then describe your symptoms to the doctor.",
    minutes: 8,
    phrases: [
      {
        id: "doctor-visit.1",
        tr: "Randevu almak istiyorum.",
        en: "I'd like to make an appointment.",
        register: "formal",
        usage: "Randevu is appointment. This is the sentence to say first when you call a clinic or office.",
      },
      {
        id: "doctor-visit.2",
        tr: "Yarın için uygun bir saat var mı?",
        en: "Is there a suitable time for tomorrow?",
        register: "neutral",
        usage:
          "Uygun means \"suitable / available\". Replace yarın with bugün (today) or bu hafta (this week).",
      },
      {
        id: "doctor-visit.3",
        tr: "Başım ağrıyor.",
        en: "I have a headache.",
        literal: "My head is hurting.",
        register: "neutral",
        usage:
          "Turkish says \"my head hurts\". Use the same pattern: Karnım ağrıyor (stomach), Dişim ağrıyor (tooth).",
      },
      {
        id: "doctor-visit.4",
        tr: "Ateşim var.",
        en: "I have a fever.",
        literal: "My fever exists.",
        register: "neutral",
        usage: "Ateş is fever; var means \"there is\". Together they mean \"I have a fever\".",
      },
      {
        id: "doctor-visit.5",
        tr: "Üç gündür hastayım.",
        en: "I've been sick for three days.",
        register: "neutral",
        usage:
          "-dir after a time word (gündür) means \"for (this long)\". Doctors always ask how long, so this is useful.",
      },
      {
        id: "doctor-visit.6",
        tr: "Penisiline alerjim var.",
        en: "I'm allergic to penicillin.",
        register: "neutral",
        usage:
          "The pattern is [thing] + -e + alerjim var. Replace penisilin with the thing you are allergic to. It is an important sentence to know.",
      },
      {
        id: "doctor-visit.7",
        tr: "Geçmiş olsun.",
        en: "Get well soon.",
        literal: "May it be past.",
        register: "neutral",
        usage:
          "Say it to anyone who is ill or had a bad experience. The reply is Sağ ol or Teşekkürler.",
      },
    ],
    dialogue: [
      { speaker: "Resepsiyon", tr: "Poliklinik, buyurun.", en: "Clinic, how can I help?" },
      { speaker: "You", tr: "İyi günler, randevu almak istiyorum. Yarın için uygun bir saat var mı?", en: "Good day, I'd like to make an appointment. Is there a suitable time for tomorrow?" },
      { speaker: "Resepsiyon", tr: "Yarın saat on birde var.", en: "Tomorrow at eleven there is." },
      { speaker: "You", tr: "Uygun, teşekkür ederim.", en: "That works, thank you." },
      { speaker: "Doktor", tr: "Şikâyetiniz nedir?", en: "What is your complaint?" },
      { speaker: "You", tr: "Üç gündür hastayım. Başım ağrıyor ve ateşim var.", en: "I've been sick for three days. I have a headache and a fever." },
      { speaker: "Doktor", tr: "Geçmiş olsun. Alerjiniz var mı?", en: "Get well soon. Do you have any allergies?" },
      { speaker: "You", tr: "Penisiline alerjim var.", en: "I'm allergic to penicillin." },
    ],
    quiz: [
      {
        id: "doctor-visit.q1",
        prompt: "Which sentence tells the doctor you have a headache?",
        options: ["Başım ağrıyor.", "Karnım ağrıyor.", "Ateşim var.", "Alerjim var."],
        answer: 0,
        explanation: "Baş is head. Karın is stomach, ateş is fever, alerji is allergy.",
      },
      {
        id: "doctor-visit.q2",
        prompt: "A friend tells you they have the flu. What do you say?",
        options: ["Geçmiş olsun.", "Afiyet olsun.", "Kolay gelsin.", "Hoş geldin."],
        answer: 0,
        explanation: "Geçmiş olsun is what you say to someone who is ill.",
      },
      {
        id: "doctor-visit.q3",
        prompt: "You phone to book a visit. What is the first thing to say?",
        options: ["Randevu almak istiyorum.", "Ateşim var.", "Yardım eder misiniz?", "Hesap, lütfen."],
        answer: 0,
        explanation: "Randevu almak istiyorum states clearly what you need.",
      },
    ],
  },
];
