import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Heart, Clock, Users, Lightbulb, Send } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors } from '../../constants/Colors';
import { API_URL } from '../../constants/Config';

const { width } = Dimensions.get('window');

// --- INTERFACES ---
interface Comment {
  id: string;
  text: string;
  author: string;
  date: string;
}

interface InstructionStep {
  step: number;
  title: string;
  text: string;
}

interface RecipeDetail {
  id: string;
  title: string;
  image: string;
  time: string;
  servings: number;
  description: string;
  category: string;
  likes: number;
  likedBy?: string[]; // Liste des emails des utilisateurs ayant liké
  // Nutrition
  carbs: string;
  proteins?: string; // Optionnel car pas toujours dans le JSON initial
  calories?: string;
  fat?: string;
  // Contenu
  ingredients: string[];
  instructions: InstructionStep[];
  tips?: string[];
  comments?: Comment[];
  author: { name: string; avatar: string | null };
}

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // États UI
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [loading, setLoading] = useState(true);

  // États Données
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  
  // États Commentaires
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // 1. CHARGEMENT
  useEffect(() => {
    fetchRecipeDetails();
  }, [id]);

  const fetchRecipeDetails = async () => {
    try {
      // On récupère d'abord l'email de l'utilisateur connecté
      const currentUserEmail = await AsyncStorage.getItem('current_user_email');
      
      const response = await fetch(`${API_URL}/recipes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRecipe(data);

        // 👇 VÉRIFICATION : Est-ce que mon email est dans la liste "likedBy" ?
        // On utilise "|| []" car les anciennes recettes n'ont peut-être pas encore ce champ
        if (currentUserEmail && data.likedBy && data.likedBy.includes(currentUserEmail)) {
          setIsLiked(true);
        } else {
          setIsLiked(false);
        }
      } else {
        Alert.alert("Erreur", "Recette introuvable");
        router.back();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 2. GESTION DU LIKE
  const handleToggleLike = async () => {
    if (!recipe) return;

    try {
      const currentUserEmail = await AsyncStorage.getItem('current_user_email');
      if (!currentUserEmail) return; // Sécurité si pas connecté

      const currentLikedByList = recipe.likedBy || [];
      let newLikedByList: string[];

      // Logique : SI déjà liké, on retire l'email. SINON on l'ajoute.
      if (isLiked) {
        // ON ENLÈVE LE LIKE (Un-like)
        newLikedByList = currentLikedByList.filter(email => email !== currentUserEmail);
      } else {
        // ON AJOUTE LE LIKE
        // Petite sécurité : si l'email est déjà dedans par erreur, on ne l'ajoute pas deux fois
        if (currentLikedByList.includes(currentUserEmail)) return;
        newLikedByList = [...currentLikedByList, currentUserEmail];
      }

      // Le nouveau nombre de likes est simplement la taille de la liste
      const newLikesCount = newLikedByList.length;

      // 1. Mise à jour Visuelle Immédiate (Optimiste)
      setIsLiked(!isLiked);
      setRecipe({ 
        ...recipe, 
        likes: newLikesCount, 
        likedBy: newLikedByList 
      });

      // 2. Envoi au serveur (On sauvegarde la liste ET le nombre)
      await fetch(`${API_URL}/recipes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          likes: newLikesCount, 
          likedBy: newLikedByList 
        })
      });

    } catch (e) {
      console.error("Erreur like", e);
      // En cas d'erreur serveur, on pourrait remettre l'état précédent ici
    }
  };

  // 3. GESTION DU COMMENTAIRE
  const handleSendComment = async () => {
    if (!newComment.trim() || !recipe) return;

    setSubmittingComment(true);
    try {
      const email = await AsyncStorage.getItem('current_user_email');
      const profileData = await AsyncStorage.getItem(`user_profile_data_${email}`);
      const userProfile = profileData ? JSON.parse(profileData) : { name: "Anonyme" };

      const commentObj: Comment = {
        id: Date.now().toString(),
        text: newComment,
        author: userProfile.name || "Utilisateur",
        date: new Date().toLocaleDateString()
      };

      const updatedComments = [...(recipe.comments || []), commentObj];

      await fetch(`${API_URL}/recipes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: updatedComments })
      });

      setRecipe({ ...recipe, comments: updatedComments });
      setNewComment('');

    } catch (error) {
      Alert.alert("Erreur", "Impossible d'envoyer le commentaire");
    } finally {
      setSubmittingComment(false);
    }
  };

  // --- RENDER ---

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!recipe) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ paddingBottom: 100 }} // Espace pour l'input commentaire
        >
          {/* Image Header */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: recipe.image }} style={styles.headerImage} />
            <View style={styles.imageOverlay} />
            
            <SafeAreaView style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                <X color="#FFF" size={24} />
              </TouchableOpacity>
            </SafeAreaView>
          </View>

          <View style={styles.content}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{recipe.title}</Text>
                <TouchableOpacity 
                  style={styles.favoriteBtn}
                  onPress={handleToggleLike}
                >
                  <Heart 
                    color={isLiked ? "#FF6B6B" : Colors.grayMedium} 
                    size={22} 
                    fill={isLiked ? "#FF6B6B" : "transparent"}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Clock color={Colors.grayMedium} size={16} />
                  <Text style={styles.metaText}>{recipe.time}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Users color={Colors.grayMedium} size={16} />
                  <Text style={styles.metaText}>{recipe.servings || 2} pers.</Text>
                </View>
                {/* Ajout des Likes ici aussi */}
                <View style={styles.metaItem}>
                   <Heart color="#FF6B6B" size={16} fill="#FF6B6B" />
                   <Text style={[styles.metaText, {color: '#FF6B6B'}]}>{recipe.likes || 0}</Text>
                </View>
              </View>

              <Text style={styles.description}>{recipe.description}</Text>
              
              {/* Auteur */}
              <View style={styles.authorRow}>
                 <Text style={styles.authorText}>Proposée par : </Text>
                 <Image source={{ uri: recipe.author?.avatar || 'https://via.placeholder.com/30'}} style={styles.miniAvatar} />
                 <Text style={styles.authorName}>{recipe.author?.name}</Text>
              </View>
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Nutritional Info */}
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionItem}>
                  <Image source={require('../../assets/Icon_glucides.png')} style={styles.nutritionIcon} />
                  <Text style={styles.nutritionText}>{recipe.carbs || '-'} glucides</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Image source={require('../../assets/Icon_avocat.png')} style={styles.nutritionIcon} />
                  <Text style={styles.nutritionText}>{recipe.proteins || '-'} protéines</Text>
                </View>
              </View>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionItem}>
                  <Image source={require('../../assets/Icon_Kcal.png')} style={styles.nutritionIcon} />
                  <Text style={styles.nutritionText}>{recipe.calories || '-'} Kcal</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Image source={require('../../assets/Icon_gras.png')} style={styles.nutritionIcon} />
                  <Text style={styles.nutritionText}>{recipe.fat || '-'} gras</Text>
                </View>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'ingredients' && styles.activeTab]}
                onPress={() => setActiveTab('ingredients')}
              >
                <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>
                  Ingrédients
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'instructions' && styles.activeTab]}
                onPress={() => setActiveTab('instructions')}
              >
                <Text style={[styles.tabText, activeTab === 'instructions' && styles.activeTabText]}>
                  Instructions
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {activeTab === 'ingredients' ? (
                <View>
                  <Text style={styles.portionsText}>Portions: {recipe.servings || 2}</Text>
                  {recipe.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.ingredientText}>{ingredient}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View>
                  {recipe.instructions && recipe.instructions.length > 0 ? (
                    recipe.instructions.map((instruction, index) => (
                      <View key={index} style={styles.instructionItem}>
                        <Text style={styles.stepNumber}>{instruction.step || index+1}.</Text>
                        <View style={styles.instructionContent}>
                          <Text style={styles.instructionTitle}>{instruction.title}</Text>
                          <Text style={styles.instructionText}>{instruction.text}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noContent}>Instructions à venir...</Text>
                  )}
                </View>
              )}
            </View>

            {/* Tips Section */}
            {recipe.tips && recipe.tips.length > 0 && (
              <View style={styles.tipsSection}>
                <View style={styles.tipsHeader}>
                  <Lightbulb color={Colors.secondary} size={20} />
                  <Text style={styles.tipsTitle}>Astuces</Text>
                </View>
                {recipe.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* --- ZONE COMMENTAIRES (NOUVEAU) --- */}
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>Commentaires ({recipe.comments?.length || 0})</Text>
            
            <View style={styles.commentsList}>
              {recipe.comments && recipe.comments.map((com, index) => (
                <View key={index} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{com.author}</Text>
                    <Text style={styles.commentDate}>{com.date}</Text>
                  </View>
                  <Text style={styles.commentText}>{com.text}</Text>
                </View>
              ))}
              {(!recipe.comments || recipe.comments.length === 0) && (
                <Text style={styles.noCommentsText}>Soyez le premier à donner votre avis !</Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* INPUT COMMENTAIRE (Fixe en bas) */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ajouter un commentaire..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !newComment.trim() && {backgroundColor: '#CCC'}]} 
            onPress={handleSendComment}
            disabled={submittingComment || !newComment.trim()}
          >
            {submittingComment ? <ActivityIndicator color="#FFF" size="small"/> : <Send color="#FFF" size={20} />}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentScroll: {
    flex: 1,
  },
  imageContainer: {
    height: 280,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: -30,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 20,
  },
  titleSection: {
    padding: 20,
    paddingTop: 25,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6EBF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.contrastMainII,
    flex: 1,
    marginRight: 10,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 14,
    color: Colors.grayMedium,
  },
  description: {
    fontSize: 14,
    color: Colors.grayDark,
    lineHeight: 22,
    marginTop: 15,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  authorText: { color: Colors.grayMedium, fontSize: 12 },
  miniAvatar: { width: 20, height: 20, borderRadius: 10, marginHorizontal: 5 },
  authorName: { color: Colors.contrastMainII, fontWeight: '600', fontSize: 12 },

  separator: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  nutritionGrid: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 10,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  nutritionItem: {
    width: (width - 50) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 8,
  },
  nutritionIcon: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  nutritionText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.contrastMainII,
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.gris,
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grayDark,
  },
  activeTabText: {
    color: '#FFF',
  },
  tabContent: {
    padding: 20,
  },
  portionsText: {
    fontSize: 14,
    color: Colors.grayMedium,
    marginBottom: 15,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 15,
    color: Colors.contrastMainII,
    flex: 1,
    lineHeight: 22,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 10,
    width: 25,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.contrastMainII,
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.grayDark,
    lineHeight: 22,
  },
  noContent: {
    fontSize: 14,
    color: Colors.grayMedium,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  tipsSection: {
    margin: 20,
    marginTop: 0,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.contrastMainII,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    color: Colors.secondary,
    marginRight: 8,
    fontSize: 14,
  },
  tipText: {
    fontSize: 13,
    color: Colors.grayDark,
    flex: 1,
    lineHeight: 20,
  },

  // STYLES COMMENTAIRES (Ajoutés)
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.contrastMainII,
    marginLeft: 20,
    marginBottom: 10,
  },
  commentsList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  commentCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentAuthor: {
    fontWeight: '700',
    fontSize: 13,
    color: Colors.contrastMainII,
  },
  commentDate: {
    fontSize: 11,
    color: Colors.grayMedium,
  },
  commentText: {
    fontSize: 14,
    color: '#334155',
  },
  noCommentsText: {
    color: Colors.grayMedium,
    textAlign: 'center',
    marginVertical: 10,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 80,
    color: Colors.black,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});