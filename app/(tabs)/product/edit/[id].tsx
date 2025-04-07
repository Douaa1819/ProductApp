

import { useState, useEffect, useRef } from "react"
import { View, StyleSheet, KeyboardAvoidingView, Platform, Animated } from "react-native"
import { Appbar, TextInput, Button, HelperText, Snackbar, ActivityIndicator } from "react-native-paper"
import { useLocalSearchParams, router } from "expo-router"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { getProduct, updateProduct } from "@/services/product-service"
import type { Product } from "@/types/product"
import { COLORS } from "@/constants/theme"

const safeHaptics = {
  impactAsync: async (style: any) => {
    if (Platform.OS !== "web" && Platform.OS !== "android") {
      try {
        const Haptics = require("expo-haptics")
        await Haptics.impactAsync(style)
      } catch (e) {
        console.log("Haptics not available", e)
      }
    }
  },
  notificationAsync: async (type: any) => {
    if (Platform.OS !== "web" && Platform.OS !== "android") {
      try {
        const Haptics = require("expo-haptics")
        await Haptics.notificationAsync(type)
      } catch (e) {
        console.log("Haptics not available", e)
      }
    }
  },
}

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const productId = id

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    category: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [loading])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const product = await getProduct(productId)
      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl || "",
          category: product.category,
        })
      }
    } catch (err) {
      showSnackbar("Impossible de charger le produit")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Omit<Product, "id">, value: string) => {
    let processedValue: string | number = value

    if (field === "price") {
      processedValue = value === "" ? 0 : Number.parseFloat(value)
    }

    setFormData({
      ...formData,
      [field]: processedValue,
    })

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est requise"
    }

    if (formData.price <= 0) {
      newErrors.price = "Le prix doit être supérieur à 0"
    }

    if (!formData.category.trim()) {
      newErrors.category = "La catégorie est requise"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm() || !productId) {
      safeHaptics.notificationAsync("error")
      return
    }

    try {
      setSaving(true)
      safeHaptics.impactAsync("medium")

      // Créer un objet sans l'imageUrl si elle est vide
      const productData = {
        ...formData,
      }

      await updateProduct(productId, productData)

      safeHaptics.notificationAsync("success")
      showSnackbar("Produit mis à jour avec succès")

      // Animation de sortie
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Rediriger vers la page de détail du produit
        setTimeout(() => {
          router.replace(`/(tabs)/product/${productId}` as any)
        }, 300)
      })
    } catch (err) {
      safeHaptics.notificationAsync("error")
      showSnackbar("Impossible de mettre à jour le produit")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message)
    setSnackbarVisible(true)
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Modifier le produit" />
      </Appbar.Header>

      <Animated.ScrollView
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="cube-outline" size={24} color={COLORS.primary} />
            <View style={styles.cardHeaderText}>
              <View style={styles.cardTitle}>
                <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.primary} />
                <View style={styles.titleContainer}>
                  <TextInput
                    label="Nom du produit"
                    value={formData.name}
                    onChangeText={(value) => handleChange("name", value)}
                    style={styles.input}
                    error={!!errors.name}
                    mode="outlined"
                    outlineColor={COLORS.border}
                    activeOutlineColor={COLORS.primary}
                  />
                </View>
              </View>
              {errors.name && <HelperText type="error">{errors.name}</HelperText>}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="text-box-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
            <View style={styles.inputContainer}>
              <TextInput
                label="Description"
                value={formData.description}
                onChangeText={(value) => handleChange("description", value)}
                multiline
                numberOfLines={4}
                style={styles.input}
                error={!!errors.description}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
              />
              {errors.description && <HelperText type="error">{errors.description}</HelperText>}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="tag-outline" size={24} color={COLORS.secondary} />
            <View style={styles.cardHeaderText}>
              <View style={styles.titleContainer}>
                <TextInput
                  label="Prix (€)"
                  value={formData.price.toString()}
                  onChangeText={(value) => handleChange("price", value)}
                  keyboardType="numeric"
                  style={styles.input}
                  error={!!errors.price}
                  mode="outlined"
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.secondary}
                  left={<TextInput.Affix text="€" />}
                />
              </View>
              {errors.price && <HelperText type="error">{errors.price}</HelperText>}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="shape-outline" size={18} color={COLORS.secondary} style={styles.inputIcon} />
            <View style={styles.inputContainer}>
              <TextInput
                label="Catégorie"
                value={formData.category}
                onChangeText={(value) => handleChange("category", value)}
                style={styles.input}
                error={!!errors.category}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.secondary}
              />
              {errors.category && <HelperText type="error">{errors.category}</HelperText>}
            </View>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={saving}
          disabled={saving}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="content-save"
        >
          Enregistrer les modifications
        </Button>
      </Animated.ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: COLORS.surface,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  inputIcon: {
    marginTop: 20,
    marginRight: 8,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  button: {
    marginTop: 8,
    marginBottom: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  snackbar: {
    backgroundColor: COLORS.secondary,
  },
})

