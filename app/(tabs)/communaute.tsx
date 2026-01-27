import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView // Ajout du ScrollView
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Search, SlidersHorizontal, ArrowRight, Heart, Clock, Plus } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { API_URL } from '../../constants/Config';

// Typage des données
interface Author {
  name: string;
  avatar: string | null;
}

export interface CommunityRecipe {
  id: string;
  title: string;
  image: string;
  time: string;
  likes: number;
  carbs: string;
  category: 'Sucré' | 'Salé';
  author: Author;
  description: string;
}

export default function CommunityScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<CommunityRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 👇 NOUVEL ÉTAT : Gestion des onglets
  const [activeTab, setActiveTab] = useState<'feed' | 'ranking'>('feed');

  // Charger les recettes
  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${API_URL}/recipes`);
      const data = await response.json();
      // On inverse pour avoir les plus récents en haut dans le flux
      setRecipes(data.reverse());
    } catch (error) {
      console.error("Erreur connexion serveur :", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [])
  );

  // --- LOGIQUE CLASSEMENT ---
  // On prend toutes les recettes, on trie par likes, on garde les 5 premières
  const getTopRecipes = () => {
    return [...recipes]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);
  };

  // --- RENDER : Carte Classique (Feed) ---
  const renderCard = ({ item }: { item: CommunityRecipe }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/community-recipe/${item.id}`)}
    >
      <View style={styles.cardRow}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Glucides {item.carbs}</Text>
            <View style={styles.dot} />
            <Clock size={12} color={Colors.grayMedium} />
            <Text style={styles.metaText}> {item.time}</Text>
          </View>
          <View style={styles.likesContainer}>
            <Heart size={14} color="#FF6B6B" fill="#FF6B6B" />
            <Text style={styles.likesText}>{item.likes}</Text>
          </View>
          <View style={styles.authorRow}>
            <View style={styles.authorInfo}>
              <Image source={{ uri: item.author.avatar || 'https://via.placeholder.com/30' }} style={styles.avatar} />
              <Text style={styles.authorName}>{item.author.name}</Text>
              <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓</Text></View>
            </View>
            <View style={styles.arrowBtn}>
               <ArrowRight size={20} color="#FFF" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // --- RENDER : Ligne du Classement (Nouveau Design) ---
  const renderRankingItem = (item: CommunityRecipe, index: number) => {
    const rank = index + 1;
    // Couleurs basées sur l'image fournie : Or pour Top 3, Vert d'eau pour les autres
    const badgeColor = rank <= 3 ? '#EAB308' : '#2DD4BF'; 

    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.rankCard}
        onPress={() => router.push(`/community-recipe/${item.id}`)}
      >
        {/* Badge Numéro */}
        <View style={[styles.rankBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.rankNumber}>{rank}</Text>
        </View>

        {/* Image */}
        <Image source={{ uri: item.image }} style={styles.rankImage} />

        {/* Infos */}
        <View style={styles.rankInfo}>
          <Text style={styles.rankTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.rankAuthorRow}>
            <Image source={{ uri: item.author.avatar || 'https://via.placeholder.com/20' }} style={styles.miniAvatar} />
            <Text style={styles.rankAuthorName}>{item.author.name}</Text>
          </View>
        </View>

        {/* Likes à droite */}
        <View style={styles.rankLikes}>
          <Heart size={16} color="#FF6B6B" fill="#FF6B6B" />
          <Text style={styles.rankLikesText}>{item.likes}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communauté</Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.grayMedium} />
          <TextInput 
            placeholder="Nom de plat, ingrédient ou utilisateur" 
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <SlidersHorizontal size={20} color={Colors.black} />
        </View>
      </View>

      {/* --- ONGLETS INTERACTIFS --- */}
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={activeTab === 'feed' ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={activeTab === 'feed' ? styles.activeTabText : styles.inactiveTabText}>Recettes</Text>
          {activeTab === 'feed' && <View style={styles.activeLine} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={activeTab === 'ranking' ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab('ranking')}
        >
          <Text style={activeTab === 'ranking' ? styles.activeTabText : styles.inactiveTabText}>Classement de la semaine</Text>
          {activeTab === 'ranking' && <View style={styles.activeLine} />}
        </TouchableOpacity>
      </View>

      {/* --- CONTENU --- */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <>
          {activeTab === 'feed' ? (
            // FLUX RECETTES (Normal)
            <>
              <View style={styles.infoBanner}>
                <Text style={styles.infoText}>Recettes proposées par la communauté, celles-ci n'ont pas été vérifiées</Text>
              </View>
              <FlatList
                data={recipes.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))}
                renderItem={renderCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRecipes(); }} />
                }
              />
            </>
          ) : (
            // VUE CLASSEMENT
            <ScrollView 
              contentContainerStyle={styles.listContent}
              refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRecipes(); }} />
              }
            >
              <View style={styles.rankingContainer}>
                 {getTopRecipes().map((item, index) => renderRankingItem(item, index))}
              </View>
            </ScrollView>
          )}
        </>
      )}

      {/* Bouton Flottant (FAB) */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/add-recipe')}
      >
        <Plus color="#FFF" size={24} />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' }, // Fond blanc général comme sur la maquette
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0D253F', textAlign: 'center' },
  
  searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 30, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#E2E8F0' },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: Colors.black },

  // Styles des Onglets
  tabsRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, alignItems: 'flex-end' },
  activeTab: { marginRight: 20, alignItems: 'center' },
  inactiveTab: { marginRight: 20, paddingBottom: 8 },
  activeTabText: { fontSize: 16, fontWeight: '700', color: Colors.primary, marginBottom: 5 },
  inactiveTabText: { fontSize: 16, fontWeight: '600', color: '#94A3B8' },
  activeLine: { height: 3, width: '100%', backgroundColor: Colors.primary, borderRadius: 2 },

  infoBanner: { backgroundColor: '#E8ECF0', marginHorizontal: 20, padding: 12, borderRadius: 10, marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 12, color: '#334155', fontWeight: '500', marginLeft: 5 },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  
  // Styles Carte Feed (Ancien)
  card: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 16, padding: 12, shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  cardRow: { flexDirection: 'row', flex: 1 },
  cardImage: { width: 100, height: 100, borderRadius: 16, marginRight: 15 },
  cardContent: { flex: 1, justifyContent: 'space-between', paddingVertical: 2 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0D253F', lineHeight: 22, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  metaText: { fontSize: 12, color: '#64748B' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CBD5E1', marginHorizontal: 6 },
  likesContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  likesText: { fontSize: 12, color: '#FF6B6B', fontWeight: '700', marginLeft: 4 },
  authorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  authorInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  authorName: { fontSize: 12, color: '#64748B', fontWeight: '600', marginRight: 4 },
  verifiedBadge: { backgroundColor: '#E0F2F1', width: 14, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  verifiedText: { color: Colors.primary, fontSize: 9, fontWeight: 'bold' },
  arrowBtn: { backgroundColor: '#0D253F', width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  // --- STYLES NOUVEAUX : CLASSEMENT ---
  rankingContainer: {
    backgroundColor: '#E6EBF0', // Fond gris-bleu comme sur l'image
    borderRadius: 20,
    padding: 10,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 10,
    padding: 10,
    // Petite ombre
    shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 
  },
  rankBadge: {
    width: 35,
    height: 60, // Forme allongée comme sur l'image
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  rankImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Image ronde
    marginRight: 12,
  },
  rankInfo: {
    flex: 1,
  },
  rankTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0D253F',
    marginBottom: 4,
  },
  rankAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 5,
  },
  rankAuthorName: {
    fontSize: 12,
    color: '#64748B',
  },
  rankLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  rankLikesText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B6B',
    marginLeft: 4,
  },

  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: Colors.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 }
});