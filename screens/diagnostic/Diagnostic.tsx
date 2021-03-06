import React, {
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';
import BottomSheet from 'reanimated-bottom-sheet';
import { RectButton } from 'react-native-gesture-handler';
import ReAnimated from 'react-native-reanimated';

import { QuestResults } from './types';
import Touchable from '../../components/Touchable';
import { useScrollToTop } from '@react-navigation/native';

const { height } = Dimensions.get('screen');

const initialState = {
  symptoms: new Map(),
  travel: undefined,
  confirmedContact: undefined,
  suspectedContact: undefined,
  age: undefined,
  illness: new Map(),
};

function reducer(state, newState) {
  return { ...state, ...newState };
}

function QuestButton({ id, text, onPress, selected }) {
  const isSelected = !!selected.get(id);

  const handlePress = () => {
    onPress(id);
  };

  return (
    <RectButton
      style={[styles.button, isSelected && styles.activeButton]}
      onPress={handlePress}
    >
      <Text style={[styles.buttonText, isSelected && styles.activeButtonText]}>
        {text}
      </Text>
    </RectButton>
  );
}

function YesNoButtons({ id, onPress, state }) {
  const isYes = state === 'yes';
  const isNo = state === 'no';

  const handleYesPress = () => {
    onPress({ [id]: 'yes' });
  };
  const handleNoPress = () => {
    onPress({ [id]: 'no' });
  };
  return (
    <>
      <RectButton
        style={[styles.button, isYes && styles.activeButton]}
        onPress={handleYesPress}
      >
        <Text style={[styles.buttonText, isYes && styles.activeButtonText]}>
          Si
        </Text>
      </RectButton>
      <RectButton
        style={[styles.button, state === 'no' && styles.activeButton]}
        onPress={handleNoPress}
      >
        <Text style={[styles.buttonText, isNo && styles.activeButtonText]}>
          No
        </Text>
      </RectButton>
    </>
  );
}

interface QuestionaryProps {
  onShowResults: (value: QuestResults) => void;
}

function Questionary({ onShowResults }: QuestionaryProps) {
  const [state, setState] = useReducer(reducer, initialState);

  const onSelectSymptoms = useCallback(
    id => {
      const newSelected = new Map(state.symptoms);
      newSelected.set(id, !state.symptoms.get(id));

      setState({ symptoms: newSelected });
    },
    [state.symptoms],
  );

  const onSelectIllness = useCallback(
    id => {
      const newSelected = new Map(state.illness);
      newSelected.set(id, !state.illness.get(id));

      setState({ illness: newSelected });
    },
    [state.illness],
  );

  useEffect(() => {
    const hasSymptoms =
      state.symptoms.size > 0 &&
      Array.from(state.symptoms).find((s: [string, boolean]) => s[1]);
    const hasIllness =
      state.illness.size > 0 &&
      Array.from(state.illness).find((s: [string, boolean]) => s[1]);
    if (
      !!hasSymptoms &&
      !!hasIllness &&
      state?.travel &&
      state?.confirmedContact &&
      state?.suspectedContact &&
      state.age > 0
    ) {
      bs.current.snapTo(0);
    } else {
      bs.current.snapTo(1);
    }
  }, [state]);

  const handlePress = () => {
    onShowResults('negative');
    setState(initialState);
    scrollRef.current.scrollTo({ x: 0, animated: false });
  };

  const renderInner = () => (
    <View style={styles.panel}>
      <Touchable style={styles.panelButton} onPress={handlePress}>
        <Text style={styles.panelButtonTitle}>REALIZAR DIAGNÓSTICO</Text>
      </Touchable>
    </View>
  );

  const bs = useRef<BottomSheet>();
  const [fall] = useState(new ReAnimated.Value(1));
  const scrollRef = React.useRef<ScrollView | null>(null);

  useScrollToTop(scrollRef);

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.questContainer}
          showsVerticalScrollIndicator={false}
          ref={scrollRef}
        >
          <ReAnimated.View
            style={{
              // alignItems: 'center',
              opacity: ReAnimated.add(0.5, ReAnimated.multiply(fall, 0.9)),
            }}
          >
            <Text style={styles.title}>
              Te haremos un par de preguntas pidiendo que detalles los síntomas
              que estás teniendo y también saber si creés haber estado en
              contacto con alguien infectado.
            </Text>
            <Text style={styles.subtitle}>Dolencias y síntomas</Text>
            <View style={styles.questButtons}>
              <QuestButton
                id="fever"
                text="Fiebre"
                onPress={onSelectSymptoms}
                selected={state.symptoms}
              />
              <QuestButton
                id="cough"
                text="Tos seca"
                onPress={onSelectSymptoms}
                selected={state.symptoms}
              />
              <QuestButton
                id="throat"
                text="Dolor de garganta"
                onPress={onSelectSymptoms}
                selected={state.symptoms}
              />
              <QuestButton
                id="breath"
                text="Dificultad para respirar"
                onPress={onSelectSymptoms}
                selected={state.symptoms}
              />
              <QuestButton
                id="headache"
                text="Dolor de cabeza"
                onPress={onSelectSymptoms}
                selected={state.symptoms}
              />
              <QuestButton
                id="diarrhea"
                text="Descompostura o diarrea"
                onPress={onSelectSymptoms}
                selected={state.symptoms}
              />
              <QuestButton
                id="tiredness"
                text="Cansancio general"
                onPress={onSelectSymptoms}
                selected={state.symptoms}
              />
            </View>
            <Text style={styles.subtitle}>Contacto cercano</Text>
            <Text style={styles.subtitle}>
              ¿Volviste de viaje de algún país con algún caso confirmado de
              coronavirus?
            </Text>
            <View style={styles.questButtons}>
              <YesNoButtons
                id="travel"
                onPress={setState}
                state={state.travel}
              />
            </View>
            <Text style={styles.subtitle}>
              ¿Tuviste contacto con alguien que haya sido confirmado como
              contagiado?
            </Text>
            <View style={styles.questButtons}>
              <YesNoButtons
                id="confirmedContact"
                onPress={setState}
                state={state.confirmedContact}
              />
            </View>
            <Text style={styles.subtitle}>
              ¿Tuviste contacto con alguien que sospeches se haya contagiado?
            </Text>
            <View style={styles.questButtons}>
              <YesNoButtons
                id="suspectedContact"
                onPress={setState}
                state={state.suspectedContact}
              />
            </View>
            <TextInput
              placeholder="Edad"
              onChangeText={text => setState({ age: text })}
              value={state.age}
              keyboardType="number-pad"
              style={styles.input}
            />
            <View style={styles.questButtons}>
              <QuestButton
                id="cancer"
                text="Cáncer"
                onPress={onSelectIllness}
                selected={state.illness}
              />
              <QuestButton
                id="cholesterol"
                text="Colesterol"
                onPress={onSelectIllness}
                selected={state.illness}
              />
              <QuestButton
                id="diabetes"
                text="Diabetes"
                onPress={onSelectIllness}
                selected={state.illness}
              />
              <QuestButton
                id="cardio"
                text="Enfermedades cardiovasculares"
                onPress={onSelectIllness}
                selected={state.illness}
              />
              <QuestButton
                id="respiratory"
                text="Enfermedades respiratorias"
                onPress={onSelectIllness}
                selected={state.illness}
              />
              <QuestButton
                id="ms"
                text="Esclerosis múltiple"
                onPress={onSelectIllness}
                selected={state.illness}
              />
              <QuestButton
                id="hypertension"
                text="Hipertensión arterial"
                onPress={onSelectIllness}
                selected={state.illness}
              />
              <QuestButton
                id="hyperthyroidism"
                text="Hipotiroidismo o hipertiroidismo"
                onPress={onSelectIllness}
                selected={state.illness}
              />
            </View>
          </ReAnimated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomSheet
        ref={bs}
        snapPoints={[80, 0]}
        renderContent={renderInner}
        initialSnap={1}
        callbackNode={fall}
      />
    </>
  );
}

export default function Diagnostic({ navigation }) {
  const insets = useSafeArea();
  const [translateY] = useState(new Animated.Value(height));
  const [visible, setVisible] = useState(true);
  const [results, setResults] = useState<undefined | QuestResults>();

  const onShowQuest = () => {
    Animated.timing(translateY, {
      toValue: height,
      easing: Easing.inOut(Easing.quad),
      duration: 500,
      useNativeDriver: true,
    }).start(() => setVisible(true));
  };
  const onShowResults = (value: QuestResults) => {
    console.log('onShowResults -> onShowResults');
    // setResults(value);
    navigation.navigate('DiagnosticResults', {
      results: value,
    });

    // setVisible(false);
    // Animated.timing(translateY, {
    //   toValue: 0,
    //   easing: Easing.inOut(Easing.quad),
    //   duration: 300,
    //   useNativeDriver: true,
    // }).start();
  };
  return (
    <View style={styles.container}>
      {/* {!visible && <Results {...{ results, translateY, onShowQuest }} />} */}
      {visible && (
        <Animated.View
          style={{
            opacity: translateY.interpolate({
              inputRange: [0, height],
              outputRange: [0, 1],
            }),
          }}
        >
          <Questionary onShowResults={onShowResults} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    // backgroundColor: '#2c2c2f',
  },
  questButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  title: { paddingTop: 20 },
  subtitle: { paddingTop: 20, paddingBottom: 10 },
  button: {
    flexDirection: 'row',
    minHeight: 50,
    width: '49%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  buttonText: {
    padding: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
  activeButton: {
    backgroundColor: '#29C097',
  },
  activeButtonText: { color: '#fff' },
  input: {
    padding: 15,
    marginVertical: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgb(204,204,204)',
  },
  panel: {
    height: 80,
    padding: 20,
    backgroundColor: '#ffffffFA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
  },
  panelButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#29C097',
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
});
