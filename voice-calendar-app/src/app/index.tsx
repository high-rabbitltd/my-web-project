import React, { useState, useEffect, useRef } from 'react';
import { 
  View, StyleSheet, TouchableOpacity, Text, FlatList, TextInput, 
  KeyboardAvoidingView, Platform, Alert, Modal, SafeAreaView, ScrollView
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { getHolidays } from 'korean-holidays';
import KoreanLunarCalendar from 'korean-lunar-calendar';
import dayjs from 'dayjs';

// 달력 로케일 설정 (영어/한국어)
LocaleConfig.locales['ko'] = {
  monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
  today: '오늘'
};
LocaleConfig.locales['en'] = {
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  today: 'Today'
};

type Memo = {
  id: string;
  title?: string;
  text: string;
  type: 'text' | 'voice';
  isCalendarEvent: boolean;
  createdAt: string; 
  targetDate?: string; 
};

const getYYYYMMDD = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function parseCommand(text: string): { title?: string; targetDate?: string; isCalendarEvent: boolean } {
  let title: string | undefined = undefined;
  let targetDate: string | undefined = undefined;
  let isCalendarEvent = false;
  const today = new Date();
  
  const titleRegex = /(?:제목은|제목|title is|title)\s+([^,.]+?)(?=\s+(?:내일|오늘|모레|캘린더|저장|save|tomorrow|today|on|\d+월|\d+일|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|$)/i;
  const titleMatch = text.match(titleRegex);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  const lowerText = text.toLowerCase();
  
  // 캘린더 관련 명시적 키워드가 있으면 캘린더로 분류
  if (lowerText.match(/(캘린더|일정|예약|저장|약속|미팅|회의|만남|calendar|schedule|event|save|meeting|appointment)/)) {
    isCalendarEvent = true;
  }

  if (lowerText.includes('오늘') || lowerText.includes('today')) {
    targetDate = getYYYYMMDD(today);
  } else if (lowerText.includes('내일') || lowerText.includes('tomorrow')) {
    const d = new Date(today); d.setDate(d.getDate() + 1);
    targetDate = getYYYYMMDD(d);
  } else if (lowerText.includes('모레') || lowerText.includes('day after tomorrow')) {
    const d = new Date(today); d.setDate(d.getDate() + 2);
    targetDate = getYYYYMMDD(d);
  } else {
    const koDateMatch = lowerText.match(/(\d{1,2})월\s*(\d{1,2})일/);
    if (koDateMatch) {
      targetDate = getYYYYMMDD(new Date(today.getFullYear(), parseInt(koDateMatch[1])-1, parseInt(koDateMatch[2])));
    } else {
      const enMonthNames = ['january','february','march','april','may','june','july','august','september','october','november','december', 'jan','feb','mar','apr','jun','jul','aug','sep','oct','nov','dec'];
      const enDateMatch = lowerText.match(new RegExp(`(${enMonthNames.join('|')})\\s+(\\d{1,2})`, 'i'));
      if (enDateMatch) {
        const mStr = enDateMatch[1];
        let mIndex = enMonthNames.indexOf(mStr);
        if (mIndex >= 12) mIndex -= 12;
        targetDate = getYYYYMMDD(new Date(today.getFullYear(), mIndex, parseInt(enDateMatch[2])));
      }
    }
  }

  // 날짜(특정 날)가 언급되었을 때, 캘린더 키워드가 없더라도 
  // 문장이 짧으면(20자 이하) 빠른 일정 등록으로 간주하고 캘린더로 보냄.
  // 반대로 문장이 너무 길면 일반 일기/메모일 확률이 높으므로 캘린더로 보내지 않음.
  if (targetDate && !isCalendarEvent) {
    if (text.length <= 20) {
      isCalendarEvent = true;
    }
  }

  if (isCalendarEvent && !targetDate) {
    targetDate = getYYYYMMDD(today);
  }

  // 만약 "제목은"으로 명시하지 않았다면, 날짜와 명령어 찌꺼기를 지우고 핵심 단어만 추출
  if (!title) {
    let cleanText = text.replace(/(\d{1,2}월\s*\d{1,2}일|오늘|내일|모레|today|tomorrow)/gi, '');
    cleanText = cleanText.replace(/(캘린더에|일정에|예약|일정|저장|등록|추가|잡아줘|해줘|저장해|등록해|해 줘|잡아 줘|저장해 줘|등록해 줘|기록해|기록|부탁해)/gi, '');
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    cleanText = cleanText.replace(/(에|을|를|으로)$/, '').trim(); // 끝에 남는 조사 제거
    if (cleanText) {
      title = cleanText;
    }
  }

  return { title, targetDate, isCalendarEvent };
}

const I18N = {
  en: {
    appTitle: "Voice Calendar",
    appSubTitle: "한국어 음성 메모 (Korean Available)",
    memoTab: "📝 Memos",
    calendarTab: "🗓️ Calendar",
    inputPlaceholder: "Speak or type...",
    noMemos: "No memos found.",
    voiceMemo: "Voice Memo",
    textMemo: "Text Memo",
    close: "Close",
    listening: "🎙️ Listening...",
    speakNow: "Please speak!",
    saveAndStop: "■ Save & Stop",
    ok: "OK",
    permissionDenied: "Microphone permission required.",
    calendarNoEvents: "No events on this date.",
    datePrefix: "Date: ",
    deleteConfirm: "Delete Memo",
    deleteMessage: "Are you sure you want to delete this memo?",
    cancel: "Cancel",
    delete: "Delete",
    voiceTip: "💡 Tip: Say 'Save to calendar' to add an event!",
    premiumTitle: "💎 Premium Payment",
    premiumDesc: "Experience unlimited AI Voice Memos.",
    oneTimeTitle: "One-time Purchase (Single Use)",
    oneTimeDesc: "Adds 20 additional voice memos",
    oneTimeBtn: "Google Play Purchase ($0.50)",
    oneTimeSuccess: "Added 20 extra memo usages!",
    subTitle: "Monthly Subscription (Unlimited)",
    subDesc: "Unlimited deep analysis & memos for a month",
    subBtn: "Google Play Subscribe ($4.99/mo)",
    subSuccess: "Premium Subscription activated! Thank you.",
    freeLimitTitle: "Free Limit Reached",
    freeLimitMsg: "You have used all your free memos. Please upgrade to continue.",
  },
  ko: {
    appTitle: "Voice Calendar",
    appSubTitle: "한국어 음성 메모",
    memoTab: "📝 일반 메모",
    calendarTab: "🗓️ 캘린더",
    inputPlaceholder: "메모할 내용을 말하거나 입력하세요...",
    noMemos: "등록된 일반 메모가 없습니다.",
    voiceMemo: "음성 메모",
    textMemo: "텍스트 메모",
    close: "닫기",
    listening: "🎙️ 듣고 있습니다...",
    speakNow: "말씀해주세요!",
    saveAndStop: "■ 저장 및 종료",
    ok: "확인",
    permissionDenied: "마이크 권한이 필요합니다.",
    calendarNoEvents: "이 날짜에 일정이 없습니다.",
    datePrefix: "작성일: ",
    deleteConfirm: "메모 삭제",
    deleteMessage: "이 메모를 삭제하시겠습니까?",
    cancel: "뒤로 가기",
    delete: "삭제",
    voiceTip: "💡 팁: '캘린더에 저장' 또는 '일정으로 예약'이라고 말하면 달력에 저장됩니다!",
    premiumTitle: "💎 프리미엄 결제",
    premiumDesc: "무제한 음성 캘린더 및 메모 기능을 경험하세요.",
    oneTimeTitle: "단건 결제 (1회용)",
    oneTimeDesc: "음성 메모 작성 20회 추가 가능",
    oneTimeBtn: "구글 플레이 결제 (500원)",
    oneTimeSuccess: "단건 결제 완료! 메모 작성 횟수가 20회 추가되었습니다.",
    subTitle: "월간 구독 (무제한)",
    subDesc: "한 달 내내 무제한 작성 및 광고 제거",
    subBtn: "구글 플레이 구독 (4,900원/월)",
    subSuccess: "프리미엄 결제가 완료되었습니다. 감사합니다!",
    freeLimitTitle: "무료 이용 횟수 소진",
    freeLimitMsg: "무료 제공 횟수(10회)를 모두 사용했습니다. 계속하려면 결제가 필요합니다.",
  }
};

export default function AppScreen() {
  const [lang, setLang] = useState<'en'|'ko'>('en');
  const t = I18N[lang];

  LocaleConfig.defaultLocale = lang;

  const [memos, setMemos] = useState<Memo[]>([]);
  const [inputText, setInputText] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recognizingText, setRecognizingText] = useState('');

  const [viewMode, setViewMode] = useState<'memo'|'calendar'>('memo');
  const [selectedDate, setSelectedDate] = useState(getYYYYMMDD());
  const [viewMemo, setViewMemo] = useState<Memo | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

  
  const [showPremium, setShowPremium] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const FREE_LIMIT = 10;

  const canUseApp = () => {
    if (isPremiumUser) return true;
    if (usageCount < FREE_LIMIT) return true;
    return false;
  };

  const showPaymentAlert = () => {
    if (Platform.OS === 'web') {
      window.alert(t.freeLimitMsg);
      setShowPremium(true);
    } else {
      Alert.alert(t.freeLimitTitle, t.freeLimitMsg, [
        { text: t.ok, onPress: () => setShowPremium(true) }
      ]);
    }
  };

  const handlePurchaseOneTime = () => {
    setUsageCount(prev => prev - 20);
    setShowPremium(false);
    if (Platform.OS === 'web') {
      window.alert(t.oneTimeSuccess);
    } else {
      Alert.alert('Success', t.oneTimeSuccess);
    }
  };

  const handlePurchaseSubscription = () => {
    setIsPremiumUser(true);
    setShowPremium(false);
    if (Platform.OS === 'web') {
      window.alert(t.subSuccess);
    } else {
      Alert.alert('Success', t.subSuccess);
    }
  };

  const accumulatedTextRef = useRef('');
  const latestRecognizingTextRef = useRef('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isIntentionalStopRef = useRef(false);

  const startSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      // 10초 침묵 시 자동 저장 및 종료
      isIntentionalStopRef.current = true;
      const finalText = latestRecognizingTextRef.current.length > accumulatedTextRef.current.length 
          ? latestRecognizingTextRef.current 
          : accumulatedTextRef.current;
      if (finalText.trim()) {
        handleAddMemo(finalText, 'voice');
      } else {
        ExpoSpeechRecognitionModule.stop();
        setIsRecording(false);
      }
    }, 10000);
  };

  useSpeechRecognitionEvent('start', () => {
    setIsRecording(true);
    startSilenceTimer();
  });

  useSpeechRecognitionEvent('end', () => {
    if (!isIntentionalStopRef.current) {
      // 안드로이드 자체 종료(1~2초) 시 0.4초 딜레이 후 연속 재시작
      setTimeout(() => {
        if (!isIntentionalStopRef.current) {
          ExpoSpeechRecognitionModule.start({
            lang: 'ko-KR',
            interimResults: true,
            continuous: true
          });
        }
      }, 400);
    } else {
      setIsRecording(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript || '';
    if (event.isFinal) {
      // isFinal이 떴다는 것은 1~2초간 쉼(침묵)이 있었다는 뜻이므로 콤마(,)를 자연스럽게 삽입
      const prefix = accumulatedTextRef.current ? accumulatedTextRef.current + ', ' : '';
      const newText = (prefix + text).trim();
      accumulatedTextRef.current = newText;
      latestRecognizingTextRef.current = newText;
      setRecognizingText(newText);
    } else {
      const prefix = accumulatedTextRef.current ? accumulatedTextRef.current + ' ' : '';
      const newText = (prefix + text).trim();
      latestRecognizingTextRef.current = newText;
      setRecognizingText(newText);
    }
    startSilenceTimer();
  });

  const lastAddedTextRef = useRef<string>('');
  const lastAddedTimeRef = useRef<number>(0);

  const handleAddMemo = (text: string, type: 'text'|'voice') => {
    if (!text.trim()) return;

    // 중복 추가 방지 (같은 텍스트가 2초 이내에 또 들어오면 무시)
    const now = Date.now();
    if (text === lastAddedTextRef.current && now - lastAddedTimeRef.current < 2000) {
      return; 
    }
    lastAddedTextRef.current = text;
    lastAddedTimeRef.current = now;

    const { title, targetDate, isCalendarEvent } = parseCommand(text);
    
    const newMemo: Memo = {
      id: Date.now().toString(),
      text,
      title,
      type,
      isCalendarEvent,
      createdAt: getYYYYMMDD(),
      targetDate
    };

    setMemos(prev => [newMemo, ...prev]);
    
    if (!isPremiumUser) {
      setUsageCount(prev => prev + 1);
    }
    
    if (isCalendarEvent) {
      setViewMode('calendar');
      if (targetDate) setSelectedDate(targetDate);
    } else {
      setViewMode('memo');
    }

    setRecognizingText('');
    setInputText('');
    
    if (type === 'voice') {
      setIsRecording(false);
      ExpoSpeechRecognitionModule.stop();
    }
  };

  const handleTextSubmit = () => {
    if (!canUseApp()) {
      showPaymentAlert();
      return;
    }
    handleAddMemo(inputText, 'text');
  };

  const handleStartRecording = async () => {
    if (!canUseApp()) {
      showPaymentAlert();
      return;
    }

    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Denied', t.permissionDenied);
      return;
    }
    
    isIntentionalStopRef.current = false;
    accumulatedTextRef.current = '';
    latestRecognizingTextRef.current = '';
    setRecognizingText('');
    
    ExpoSpeechRecognitionModule.start({
      lang: 'ko-KR',
      interimResults: true,
      continuous: true
    });
  };

  const handleStopRecordingManual = () => {
    isIntentionalStopRef.current = true;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    const finalText = latestRecognizingTextRef.current.length > accumulatedTextRef.current.length 
        ? latestRecognizingTextRef.current 
        : accumulatedTextRef.current;
        
    if (finalText.trim()) {
      handleAddMemo(finalText, 'voice');
    } else {
      ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
    }
  };

  const handleDeleteMemo = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(t.deleteMessage)) {
        setMemos(prev => prev.filter(m => m.id !== id));
      }
    } else {
      Alert.alert(t.deleteConfirm, t.deleteMessage, [
        { text: t.cancel, style: 'cancel' },
        { text: t.delete, style: 'destructive', onPress: () => {
            setMemos(prev => prev.filter(m => m.id !== id));
          }
        }
      ]);
    }
  };

  const markedDates = memos
    .filter(m => m.isCalendarEvent && m.targetDate)
    .reduce((acc, m) => {
      acc[m.targetDate!] = { marked: true, dotColor: '#4A90E2' };
      return acc;
    }, {} as any);
  
  if (viewMode === 'calendar') {
    markedDates[selectedDate] = { ...markedDates[selectedDate], selected: true, selectedColor: '#4A90E2' };
  }

  const handleDayPress = (dateString: string) => {
    setSelectedDate(dateString);
    setShowDayModal(true);
  };

  const renderMemoItem = ({ item }: { item: Memo }) => (
    <View style={styles.memoItemWrapper}>
      <TouchableOpacity style={styles.memoItem} onPress={() => setViewMemo(item)}>
        <Text style={styles.memoTypeIcon}>{item.type === 'voice' ? '🎙️' : '📝'}</Text>
        <View style={styles.memoTextContainer}>
          {item.title && <Text style={styles.memoTitle}>{item.title}</Text>}
          <Text style={styles.memoDate}>{t.datePrefix}{item.createdAt}</Text>
          <Text style={styles.memoText} numberOfLines={2}>{item.text}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteMemo(item.id)}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const generalMemos = memos.filter(m => !m.isCalendarEvent);
  const calendarMemos = memos.filter(m => m.isCalendarEvent && m.targetDate === selectedDate);
  const displayMemos = viewMode === 'memo' ? generalMemos : calendarMemos;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t.appTitle}</Text>
          <Text style={styles.headerSubtitle}>{t.appSubTitle}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.usageCountText}>
            {!isPremiumUser && `(${usageCount}/${FREE_LIMIT})`}
          </Text>
          {!isPremiumUser && (
            <TouchableOpacity style={styles.premiumBtnTop} onPress={() => setShowPremium(true)}>
              <Text style={styles.premiumBtnTextTop}>👑</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.langBtn} 
            onPress={() => setLang(lang === 'en' ? 'ko' : 'en')}
          >
            <Text style={styles.langBtnText}>{lang === 'en' ? 'KOR' : 'ENG'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, viewMode === 'memo' && styles.tabActive]}
          onPress={() => setViewMode('memo')}
        >
          <Text style={[styles.tabText, viewMode === 'memo' && styles.tabTextActive]}>{t.memoTab}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, viewMode === 'calendar' && styles.tabActive]}
          onPress={() => setViewMode('calendar')}
        >
          <Text style={[styles.tabText, viewMode === 'calendar' && styles.tabTextActive]}>{t.calendarTab}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentSection}>
        {viewMode === 'calendar' && (
          <ScrollView style={styles.calendarScroll}>
            <Calendar
              key={lang}
              monthFormat={lang === 'ko' ? 'yyyy년 M월' : 'MMMM yyyy'}
              onDayPress={(day: any) => handleDayPress(day.dateString)}
              markedDates={markedDates}
              theme={{
                calendarBackground: '#F4F7FB',
                textSectionTitleColor: '#2C3E50',
                monthTextColor: '#2C3E50',
                arrowColor: '#4A90E2',
                textDayHeaderFontWeight: 'bold',
                'stylesheet.calendar.main': {
                  week: {
                    marginTop: 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }
                }
              }}
              style={styles.calendar}
              dayComponent={({ date, state }: any) => {
                const dayMemos = memos.filter(m => m.isCalendarEvent && m.targetDate === date.dateString);
                const isToday = state === 'today';
                const isDisabled = state === 'disabled';
                
                const parsedDate = dayjs(date.dateString);
                const isSunday = parsedDate.day() === 0;
                const isSaturday = parsedDate.day() === 6;
                
                const holidays = getHolidays(parsedDate.year());
                const holiday = holidays.find(h => {
                  const hDateStr = new Date(h.date.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
                  return hDateStr === date.dateString;
                });
                const isHoliday = !!holiday;
                const holidayName = holiday ? holiday.nameKo : null;
                
                const lunar = new KoreanLunarCalendar();
                lunar.setSolarDate(parsedDate.year(), parsedDate.month() + 1, parsedDate.date());
                const lunarInfo = lunar.getLunarCalendar();
                const lunarText = `${lunarInfo.month}.${lunarInfo.day}`;
                
                let dayTextColor = '#34495E';
                if (isDisabled) dayTextColor = '#BDC3C7';
                else if (isSunday || isHoliday) dayTextColor = '#E74C3C';
                else if (isSaturday) dayTextColor = '#2980B9';

                return (
                  <TouchableOpacity 
                    style={[styles.customDayCell, isToday && styles.customDayToday]} 
                    onPress={() => {
                      if (!isDisabled) handleDayPress(date.dateString);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.customDayText, { color: dayTextColor }, isToday && styles.customDayTodayText]}>
                      {date.day}
                    </Text>
                    
                    {!isDisabled && (
                      <Text style={[styles.lunarText, isHoliday && styles.holidayText]} numberOfLines={1}>
                        {isHoliday ? holidayName : lunarText}
                      </Text>
                    )}

                    <View style={styles.dayMemosContainer}>
                      {dayMemos.slice(0, 3).map((memo, idx) => {
                        const colors = ['#FFD1DC', '#FFECB3', '#C8E6C9', '#BBDEFB', '#E1BEE7'];
                        return (
                          <View key={memo.id} style={[styles.dayMemoBar, { backgroundColor: colors[idx % 5] }]}>
                            <Text style={styles.dayMemoText} numberOfLines={1}>
                              {memo.title || memo.text}
                            </Text>
                          </View>
                        );
                      })}
                      {dayMemos.length > 3 && (
                        <Text style={styles.dayMemoMore}>+{dayMemos.length - 3}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </ScrollView>
        )}
        
        {viewMode === 'memo' && (
          <FlatList
            data={displayMemos}
            keyExtractor={item => item.id}
            renderItem={renderMemoItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t.noMemos}</Text>
              </View>
            }
          />
        )}
      </View>

      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>{t.voiceTip}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={t.inputPlaceholder}
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleTextSubmit}
          />
          <TouchableOpacity style={styles.micBtn} onPress={handleStartRecording}>
            <Text style={styles.micBtnText}>🎙️</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Mock Ad Banner for free users */}
      {!isPremiumUser && (
        <View style={styles.adBanner}>
          <Text style={styles.adText}>광고 영역 (Google AdMob Banner)</Text>
        </View>
      )}

      {/* Recording Modal */}
      <Modal visible={isRecording} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.recordingScreen}>
          <View style={styles.recordingContent}>
            <Text style={styles.recordingTitle}>{t.listening}</Text>
            
            <ScrollView contentContainerStyle={styles.recognizingTextContainer}>
              <Text style={styles.recognizingText}>
                {recognizingText || t.speakNow}
              </Text>
            </ScrollView>

            <TouchableOpacity style={styles.stopRecordingBtn} onPress={handleStopRecordingManual}>
              <Text style={styles.stopRecordingBtnText}>{t.saveAndStop}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Memo Detail Modal */}
      <Modal visible={viewMemo != null} animationType="fade" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.memoDetailContainer}>
            <Text style={styles.memoDetailType}>
              {viewMemo?.type === 'voice' ? `🎙️ ${t.voiceMemo}` : `📝 ${t.textMemo}`}
            </Text>
            <ScrollView style={styles.memoDetailScrollView}>
              {viewMemo?.title && <Text style={styles.memoDetailTitle}>{viewMemo.title}</Text>}
              <Text style={styles.memoDetailDate}>{t.datePrefix}{viewMemo?.createdAt}</Text>
              <Text style={styles.memoDetailText}>{viewMemo?.text}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setViewMemo(null)}>
              <Text style={styles.closeBtnText}>{t.ok}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Day Memos Modal (Calendar Click) */}
      <Modal visible={showDayModal} animationType="slide" transparent={true}>
        <View style={styles.modalBackgroundDark}>
          <View style={styles.dayModalContainer}>
            <View style={styles.dayModalHeader}>
              <Text style={styles.dayModalTitle}>{selectedDate}</Text>
              <TouchableOpacity onPress={() => setShowDayModal(false)}>
                <Text style={styles.dayModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={calendarMemos}
              keyExtractor={item => item.id}
              renderItem={renderMemoItem}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{t.calendarNoEvents}</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Premium Payment Page (Full Screen Modal) */}
      <Modal visible={showPremium} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.paymentScreen}>
          <ScrollView contentContainerStyle={styles.paymentContainer}>
            <Text style={styles.paymentLogo}>💎</Text>
            <Text style={styles.paymentTitle}>{t.premiumTitle}</Text>
            <Text style={styles.paymentDesc}>{t.premiumDesc}</Text>
            
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>{t.oneTimeTitle}</Text>
              <Text style={styles.planDesc}>{t.oneTimeDesc}</Text>
              <TouchableOpacity style={styles.planBtnOutline} onPress={handlePurchaseOneTime}>
                <Text style={styles.planBtnTextOutline}>{t.oneTimeBtn}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.planCardHighlight}>
              <Text style={styles.planTitleHighlight}>{t.subTitle}</Text>
              <Text style={styles.planDescHighlight}>{t.subDesc}</Text>
              <TouchableOpacity style={styles.planBtnPrimary} onPress={handlePurchaseSubscription}>
                <Text style={styles.planBtnTextPrimary}>{t.subBtn}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.paymentCancelBtn} onPress={() => setShowPremium(false)}>
              <Text style={styles.paymentCancelBtnText}>{t.cancel}</Text>
            </TouchableOpacity>
            
            <Text style={styles.paymentFooter}>Secured by Google Play In-App Billing</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#2C3E50', borderBottomWidth: 1, borderBottomColor: '#1A252F' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#BDC3C7', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  usageCountText: { fontSize: 12, color: '#BDC3C7', marginRight: 8, fontWeight: 'bold' },
  langBtn: { backgroundColor: '#34495E', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#455A64' },
  langBtnText: { color: '#ECF0F1', fontWeight: 'bold', fontSize: 14 },
  premiumBtnTop: { backgroundColor: '#FFF9E6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#FFD700' },
  premiumBtnTextTop: { fontSize: 14 },
  tabContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#EAF2F8', borderBottomWidth: 1, borderBottomColor: '#D4E6F1' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: 'white', marginHorizontal: 5, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  tabActive: { backgroundColor: '#4A90E2' },
  tabText: { fontSize: 16, color: '#7F8C8D', fontWeight: 'bold' },
  tabTextActive: { color: 'white' },
  contentSection: { flex: 1 },
  calendar: { borderBottomWidth: 1, borderBottomColor: '#EEEEEE', paddingBottom: 10 },
  listContainer: { padding: 15 },
  memoItemWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  memoItem: { flex: 1, flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  memoTypeIcon: { fontSize: 24, marginRight: 15, marginTop: 5 },
  memoTextContainer: { flex: 1 },
  memoTitle: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50', marginBottom: 4 },
  memoDate: { fontSize: 12, color: '#95A5A6', marginBottom: 6 },
  memoText: { fontSize: 15, color: '#34495E', lineHeight: 22 },
  deleteBtn: { padding: 15, marginLeft: 5, backgroundColor: '#FFEAEA', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { color: '#E74C3C', fontWeight: 'bold', fontSize: 16 },
  emptyContainer: { marginTop: 40, alignItems: 'center' },
  emptyText: { color: '#7F8C8D', fontSize: 16 },
  tipContainer: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#EAF2F8', borderTopWidth: 1, borderTopColor: '#D4E6F1' },
  tipText: { color: '#2980B9', fontSize: 13, fontWeight: '600' },
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#EEEEEE', alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: '#F5F6FA', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, fontSize: 16, marginRight: 10 },
  micBtn: { backgroundColor: '#E74C3C', width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  micBtnText: { fontSize: 24 },
  adBanner: { backgroundColor: '#EAECEE', padding: 15, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#BDC3C7' },
  adText: { color: '#7F8C8D', fontSize: 14, fontWeight: 'bold' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  recordingScreen: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  recordingContent: { height: '50%', backgroundColor: '#1E1E1E', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, justifyContent: 'space-between' },
  recordingTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginTop: 20 },
  recognizingTextContainer: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
  recognizingText: { color: '#4EE29B', fontSize: 36, lineHeight: 50, fontWeight: '600' },
  stopRecordingBtn: { backgroundColor: '#E74C3C', paddingVertical: 25, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  stopRecordingBtnText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  memoDetailContainer: { backgroundColor: 'white', borderRadius: 20, padding: 25, width: '100%', maxHeight: '80%' },
  memoDetailType: { fontSize: 20, fontWeight: 'bold', color: '#34495E', marginBottom: 20 },
  memoDetailScrollView: { marginBottom: 20 },
  memoDetailTitle: { fontSize: 22, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10 },
  memoDetailDate: { fontSize: 14, color: '#7F8C8D', marginBottom: 15 },
  memoDetailText: { fontSize: 18, lineHeight: 28, color: '#2C3E50' },
  closeBtn: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  // Custom Calendar Styles
  calendarScroll: { flex: 1, backgroundColor: '#F4F7FB' },
  customDayCell: { flex: 1, minHeight: 80, width: '100%', padding: 2, borderTopWidth: 1, borderColor: '#E5E8EB', alignItems: 'center' },
  customDayText: { fontSize: 14, color: '#34495E', fontWeight: '600', marginBottom: 2 },
  customDayToday: { backgroundColor: '#E3F2FD', borderRadius: 8 },
  customDayTodayText: { color: '#2980B9', fontWeight: 'bold' },
  customDayDisabled: { color: '#BDC3C7' },
  lunarText: { fontSize: 9, color: '#95A5A6', marginBottom: 2 },
  holidayText: { color: '#E74C3C', fontWeight: 'bold', fontSize: 10 },
  dayMemosContainer: { width: '100%', alignItems: 'center' },
  dayMemoBar: { width: '95%', paddingVertical: 2, paddingHorizontal: 4, borderRadius: 4, marginBottom: 2 },
  dayMemoText: { fontSize: 9, color: '#333', fontWeight: 'bold', textAlign: 'left' },
  dayMemoMore: { fontSize: 10, color: '#7F8C8D', marginTop: 1 },
  
  // Day Modal Styles
  modalBackgroundDark: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  dayModalContainer: { backgroundColor: '#F7F9FC', borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '70%', paddingBottom: 20 },
  dayModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEEEEE', backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  dayModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
  dayModalClose: { fontSize: 24, color: '#7F8C8D', paddingHorizontal: 10 },

  // Payment Screen Styles
  paymentScreen: { flex: 1, backgroundColor: '#F9FAFC' },
  paymentContainer: { padding: 30, alignItems: 'center' },
  paymentLogo: { fontSize: 60, marginBottom: 10 },
  paymentTitle: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10 },
  paymentDesc: { fontSize: 16, color: '#7F8C8D', textAlign: 'center', marginBottom: 30 },
  planCard: { width: '100%', backgroundColor: 'white', borderRadius: 16, padding: 25, marginBottom: 20, borderWidth: 1, borderColor: '#BDC3C7' },
  planTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10 },
  planDesc: { fontSize: 14, color: '#7F8C8D', marginBottom: 20 },
  planBtnOutline: { borderWidth: 2, borderColor: '#4A90E2', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  planBtnTextOutline: { color: '#4A90E2', fontSize: 16, fontWeight: 'bold' },
  planCardHighlight: { width: '100%', backgroundColor: 'white', borderRadius: 16, padding: 25, marginBottom: 20, borderWidth: 2, borderColor: '#4A90E2', shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  planTitleHighlight: { fontSize: 20, fontWeight: 'bold', color: '#4A90E2', marginBottom: 10 },
  planDescHighlight: { fontSize: 14, color: '#7F8C8D', marginBottom: 20 },
  planBtnPrimary: { backgroundColor: '#4A90E2', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  planBtnTextPrimary: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  paymentCancelBtn: { marginTop: 10, padding: 15 },
  paymentCancelBtnText: { color: '#95A5A6', fontSize: 16, textDecorationLine: 'underline' },
  paymentFooter: { marginTop: 30, fontSize: 12, color: '#BDC3C7' }
});
