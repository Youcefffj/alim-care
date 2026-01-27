import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Settings, Share, Edit2, HelpCircle, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

import { Colors } from '../../constants/Colors';
import { GlycemicCircle } from '../../components/GlycemicCircle';

interface GlycemicRecord {
  id: string;
  value: number;
  date: string;
  period: string;
  timing: string;
}

export default function SanteScreen() {
  const [history, setHistory] = useState<GlycemicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [period, setPeriod] = useState('Matin');
  const [timing, setTiming] = useState('Avant repas');
  
  // Onglets Graphique
  const [viewScope, setViewScope] = useState<'Quotidien' | 'Hebdo'>('Quotidien');

  const [modalVisible, setModalVisible] = useState(false);
  const [newValue, setNewValue] = useState('');

  const loadHistory = async () => {
    try {
      const json = await AsyncStorage.getItem('user_glycemic_history');
      if (json) {
        const data = JSON.parse(json);
        data.sort((a: GlycemicRecord, b: GlycemicRecord) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setHistory(data);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useFocusEffect(
    useCallback(() => { loadHistory(); }, [])
  );

  const handleAddMeasure = async () => {
    // En mg/dL, on attend un entier, mais on gère quand même la virgule au cas où
    const formattedValue = newValue.replace(',', '.');
    const parsedValue = parseFloat(formattedValue);

    // Validation cohérente avec mg/dL (ex: entre 20 et 600)
    if (!formattedValue || isNaN(parsedValue) || parsedValue < 10 || parsedValue > 1000) {
      Alert.alert("Erreur", "Veuillez entrer une valeur valide en mg/dL (ex: 120)");
      return;
    }

    const newRecord: GlycemicRecord = {
      id: Date.now().toString(),
      value: Math.round(parsedValue), // On stocke des entiers pour mg/dL
      date: new Date().toISOString(),
      period: period,
      timing: timing
    };

    const updatedHistory = [...history, newRecord];
    
    try {
      await AsyncStorage.setItem('user_glycemic_history', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      setModalVisible(false);
      setNewValue('');
    } catch (e) {
      Alert.alert("Erreur", "Impossible de sauvegarder la mesure");
    }
  };

  const lastRecord = history.length > 0 ? history[history.length - 1] : null;
  
  // --- LOGIQUE D'AFFICHAGE DU GRAPHIQUE ---
  const getChartData = () => {
    if (history.length === 0) return [{ value: 0, label: 'Start' }];

    if (viewScope === 'Quotidien') {
      return history.map(record => {
        const dateObj = new Date(record.date);
        const timeLabel = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return {
          value: record.value,
          label: timeLabel,
          dataPointText: record.value.toString(),
        };
      });
    } else {
      // MODE HEBDO : Moyenne par jour
      const groups: { [key: string]: number[] } = {};
      
      history.forEach(record => {
        const dateObj = new Date(record.date);
        const dateKey = dateObj.toISOString().split('T')[0];
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(record.value);
      });

      const averagedData = Object.keys(groups).map(dateKey => {
        const values = groups[dateKey];
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const roundedAvg = Math.round(avg); // Moyenne arrondie à l'entier

        const dateObj = new Date(dateKey);
        const dayLabel = dateObj.toLocaleDateString('fr-FR', { weekday: 'short' });

        return {
          value: roundedAvg,
          label: dayLabel,
          dataPointText: roundedAvg.toString(),
        };
      });

      return averagedData;
    }
  };

  const finalChartData = getChartData();
  
  const average = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.value, 0) / history.length)
    : 0;
  
  // Dans la cible : Standard diabète type 1/2 est souvent 70-180 mg/dL
  const inTargetCount = history.filter(r => r.value >= 70 && r.value <= 180).length;
  const inTargetPercent = history.length > 0 ? Math.round((inTargetCount / history.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Santé</Text>
        </View>

        <Text style={styles.sectionTitle}>Mon suivi glycémique</Text>
        <Text style={styles.subTitle}>
            {lastRecord ? new Date(lastRecord.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : "Aucune donnée"}
        </Text>

        {/* Filtres Côte à Côte */}
        <View style={{ height: 40, marginBottom: 20 }}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.filtersScrollContent}
            >
                <View style={styles.pillGroup}>
                    {['Matin', 'Midi', 'Soir'].map((p) => (
                    <TouchableOpacity key={p} style={[styles.pill, period === p && styles.pillActive]} onPress={() => setPeriod(p)}>
                        <Text style={[styles.pillText, period === p && styles.pillTextActive]}>{p}</Text>
                    </TouchableOpacity>
                    ))}
                </View>
                
                <View style={{ width: 10 }} />

                <View style={styles.pillGroup}>
                    {['Avant repas', 'Après repas'].map((t) => (
                    <TouchableOpacity key={t} style={[styles.pill, timing === t && styles.pillActive]} onPress={() => setTiming(t)}>
                        <Text style={[styles.pillText, timing === t && styles.pillTextActive]}>{t}</Text>
                    </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>

        {/* CARTE PRINCIPALE */}
        <View style={styles.mainCard}>
          <View style={styles.circleWrapper}>
             <GlycemicCircle 
                value={lastRecord ? lastRecord.value : 0} 
                max={300} // Échelle cohérente avec le graph
                label="" 
             />
          </View>

          <View style={styles.infoWrapper}>
             <View style={styles.dateBlock}>
                <Text style={styles.dateLabel}>Dernière mesure :</Text>
                {lastRecord ? (
                    <>
                        <Text style={styles.dateValue}>{new Date(lastRecord.date).toLocaleDateString('fr-FR')}</Text>
                        <Text style={styles.dateValue}>{new Date(lastRecord.date).toLocaleTimeString('fr-FR')}</Text>
                    </>
                ) : (
                    <Text style={[styles.dateValue, {color: Colors.grayMedium}]}>--/--</Text>
                )}
             </View>
             
             <TouchableOpacity style={styles.editBtn} onPress={() => setModalVisible(true)}>
                <Edit2 size={16} color={Colors.primary} />
                <Text style={styles.editBtnText}>Saisir</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Graphique */}
        <View style={styles.chartHeaderRow}>
            <View style={styles.scopeSwitch}>
                <TouchableOpacity style={[styles.scopeBtn, viewScope === "Quotidien" && styles.scopeBtnActive]} onPress={() => setViewScope("Quotidien")}>
                    <Text style={[styles.scopeText, viewScope === "Quotidien" && styles.scopeTextActive]}>Quotidien</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.scopeBtn, viewScope === "Hebdo" && styles.scopeBtnActive]} onPress={() => setViewScope("Hebdo")}>
                    <Text style={[styles.scopeText, viewScope === "Hebdo" && styles.scopeTextActive]}>Hebdo</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity><Share size={20} color={Colors.grayMedium} /></TouchableOpacity>
                <TouchableOpacity><Settings size={20} color={Colors.grayMedium} /></TouchableOpacity>
            </View>
        </View>

        <View style={styles.chartCard}>
            {history.length > 0 ? (
                <LineChart
                    data={finalChartData}
                    color={Colors.primary}
                    thickness={3}
                    dataPointsColor={Colors.primary}
                    textColor={Colors.grayMedium}
                    startFillColor={Colors.primary}
                    endFillColor={Colors.white}
                    startOpacity={0.2}
                    endOpacity={0.0}
                    initialSpacing={20}
                    endSpacing={20}
                    spacing={50}
                    yAxisTextStyle={{ color: Colors.grayMedium, fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: Colors.contrastMainII, fontSize: 10 }}
                    
                    // 👇 CONFIGURATION MG/DL 👇
                    maxValue={300}              // Max 300 mg/dL
                    noOfSections={6}            // 6 sections égales
                    stepValue={50}              // Pas de 50 (0, 50, 100... 300)
                    formatYLabel={(label) => parseInt(label).toString()} // Pas de décimales
                    
                    hideRules
                    hideYAxisText={false}
                    yAxisThickness={0}
                    xAxisThickness={0}
                    rulesType="solid"
                    rulesColor={Colors.gris}
                    curved
                    areaChart
                />
            ) : (
                <View style={{height: 200, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: Colors.grayMedium}}>Aucune donnée pour le graphique</Text>
                </View>
            )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Moyenne</Text>
                {/* Affichage sans décimales pour mg/dL */}
                <Text style={styles.statValuePrimary}>{average} <Text style={{fontSize:10}}>mg/dL</Text></Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Dans la cible</Text>
                <Text style={styles.statValuePrimary}>{inTargetPercent} %</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Mesures</Text>
                <Text style={styles.statValuePrimary}>{history.length}</Text>
            </View>
        </View>

        <TouchableOpacity style={styles.infoBanner}>
            <HelpCircle size={20} color={Colors.white} style={{marginRight: 10}} />
            <Text style={styles.infoBannerText}>Pourquoi la glycémie varie-t-elle ?</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Saisie */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Nouvelle mesure</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <X size={24} color={Colors.black} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.modalLabel}>Quelle est votre glycémie actuelle ?</Text>
                <View style={styles.inputRow}>
                    <TextInput 
                        style={styles.input}
                        placeholder="120"  // Placeholder mis à jour
                        keyboardType="decimal-pad"
                        value={newValue}
                        onChangeText={setNewValue}
                        autoFocus
                    />
                    <Text style={styles.unitText}>mg/dL</Text>
                </View>
                <View style={styles.contextInfo}>
                    <Text style={{color: Colors.grayMedium}}>Contexte : {period} • {timing}</Text>
                </View>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddMeasure}>
                    <Text style={styles.saveBtnText}>Enregistrer</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.contrastMainII },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.contrastMainII, marginBottom: 5 },
  subTitle: { fontSize: 16, color: Colors.primary, fontWeight: '600', marginBottom: 15, textTransform: 'capitalize' },

  filtersScrollContent: { alignItems: 'center' },
  pillGroup: { flexDirection: 'row', backgroundColor: Colors.gris, borderRadius: 20, padding: 4 },
  pill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
  pillActive: { backgroundColor: Colors.primary },
  pillText: { fontSize: 12, color: Colors.grayMedium, fontWeight: '600' },
  pillTextActive: { color: Colors.white },

  mainCard: { 
    backgroundColor: Colors.white, 
    borderRadius: 20, 
    paddingVertical: 12, 
    paddingHorizontal: 15,
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    borderWidth: 1, borderColor: Colors.gris,
    shadowColor: Colors.black, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    overflow: 'visible',
    zIndex: 10,
  },
  circleWrapper: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: -60, 
  },
  infoWrapper: {
    flex: 1,
    height: 120,
    paddingLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: Colors.gris,
    justifyContent: 'space-around',
    paddingVertical: 5
  },
  dateBlock: { },
  dateLabel: { fontSize: 12, color: Colors.grayMedium, fontWeight: '600' },
  dateValue: { fontSize: 15, color: Colors.contrastMainII, fontWeight: '700', marginTop: 2 },
  
  editBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.gris, 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 12, 
    alignSelf: 'flex-start' 
  },
  editBtnText: { marginLeft: 6, color: Colors.primary, fontWeight: '700', fontSize: 13 },

  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  scopeSwitch: { flexDirection: 'row', backgroundColor: Colors.gris, borderRadius: 10, padding: 4 },
  scopeBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  scopeBtnActive: { backgroundColor: Colors.primary },
  scopeText: { fontSize: 12, color: Colors.grayMedium, fontWeight: '600' },
  scopeTextActive: { color: Colors.white },
  chartCard: { 
    backgroundColor: Colors.white, borderRadius: 20, padding: 15, paddingBottom: 20, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.primary,
    shadowColor: Colors.black, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    overflow: 'hidden'
  },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 25 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 16, padding: 12, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.black, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  statLabel: { fontSize: 11, color: Colors.contrastMainII, fontWeight: '700', marginBottom: 5 },
  statValuePrimary: { fontSize: 16, color: Colors.primary, fontWeight: 'bold' },

  infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bluefilterbutton, padding: 15, borderRadius: 15 },
  infoBannerText: { color: Colors.white, fontWeight: '700', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: Colors.white, borderRadius: 20, padding: 25, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.contrastMainII },
  modalLabel: { fontSize: 14, color: Colors.grayDark, marginBottom: 15 },
  inputRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 20 },
  input: { fontSize: 40, fontWeight: 'bold', color: Colors.primary, borderBottomWidth: 2, borderBottomColor: Colors.primary, width: 120, textAlign: 'center', paddingBottom: 5 },
  unitText: { fontSize: 20, color: Colors.grayMedium, marginLeft: 10 },
  contextInfo: { backgroundColor: Colors.gris, padding: 10, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
});