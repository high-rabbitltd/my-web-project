import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ko: {
    translation: {
      title: '몽토끼 꿈풀이',
      subtitle: '당신의 무의식이 보내는 메시지를 확인하세요',
      selectDream: '어떤 꿈을 꾸셨나요?',
      orInput: '어젯밤 무슨꿈을 꾸었나요? 상세하게 물어보세요',
      inputPlaceholder: '자유롭게 꿈의 상황을 입력하세요...',
      interpretBtn: '해몽하기',
      loading: '무의식을 분석 중입니다...',
      resultTitle: '해몽 결과',
      commonDreams: {
        first_place: '1등 하는 꿈',
        family: '가족 만나는 꿈',
        beaten: '구타당하는 꿈',
        lost: '길 잃은 꿈',
        falling: '높은곳에서 떨어지는 꿈',
        chased: '도망치는 꿈',
        money: '돈 줍는 꿈',
        poop: '똥싸는 꿈',
        haircut: '머리카락 자르는 꿈',
        water: '물에 빠지는 꿈',
        snake: '뱀에 물리는 꿈',
        lightning: '번개 맞는 꿈',
        naked: '벌거벗은 꿈',
        flying: '비행하는 꿈',
        gift: '선물 받는 꿈',
        exam: '시험치는 꿈',
        lost_shoes: '신발 잃어 버린 꿈',
        crying: '울고있는 꿈',
        celebrity: '유명인사 만나는 꿈',
        eating: '음식 먹는 꿈',
        teeth: '이 빠지는 꿈',
        breakup: '이별하는 꿈',
        pregnancy: '임신하는 꿈',
        car_crash: '자동차 사고 꿈',
        ancestor: '조상님 만나는 꿈',
        death: '죽는 꿈',
        earthquake: '지진나는 꿈',
        house_fire: '집이 불타는 꿈',
        big_tree: '큰 나무 꿈',
        kiss: '키스하는 꿈',
        typhoon: '태풍부는 꿈',
        makeup: '화장하는 꿈'
      }
    }
  },
  en: {
    translation: {
      title: 'Dream Interpretation',
      subtitle: 'Analyzing symbols of the unconscious.',
      selectDream: 'What did you dream about?',
      orInput: 'Or input manually',
      inputPlaceholder: 'Describe your dream in detail...',
      interpretBtn: 'Interpret',
      loading: 'Analyzing unconsciousness...',
      resultTitle: 'Interpretation Result',
      commonDreams: {
        first_place: 'Winning first place',
        family: 'Meeting family',
        beaten: 'Being beaten',
        lost: 'Getting lost',
        falling: 'Falling from high',
        chased: 'Being chased',
        money: 'Finding money',
        poop: 'Pooping',
        haircut: 'Cutting hair',
        water: 'Falling in water',
        snake: 'Snake bite',
        lightning: 'Struck by lightning',
        naked: 'Being naked',
        flying: 'Flying',
        gift: 'Receiving a gift',
        exam: 'Taking an exam',
        lost_shoes: 'Losing shoes',
        crying: 'Crying',
        celebrity: 'Meeting celebrity',
        eating: 'Eating food',
        teeth: 'Losing teeth',
        breakup: 'Breakup',
        pregnancy: 'Pregnancy',
        car_crash: 'Car crash',
        ancestor: 'Meeting ancestor',
        death: 'Dying',
        earthquake: 'Earthquake',
        house_fire: 'House fire',
        big_tree: 'Big tree',
        kiss: 'Kissing',
        typhoon: 'Typhoon',
        makeup: 'Doing makeup'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko', 
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
