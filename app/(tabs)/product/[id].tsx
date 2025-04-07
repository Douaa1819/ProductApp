

import { useState, useEffect, useRef } from "react"
import { View, StyleSheet, ScrollView, Animated, Dimensions, Share, Platform } from "react-native"
import {
  Appbar,
  Card,
  Title,
  Paragraph,
  Button,
  Portal,
  Dialog,
  ActivityIndicator,
  Chip,
  Text,
  FAB,
} from "react-native-paper"
import { useLocalSearchParams, Link, router } from "expo-router"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { getProduct, deleteProduct } from "../../../services/product-service"
import type { Product } from "../../../types/product"
import { COLORS } from "../../../constants/theme"
import EmptyState from "../../../components/EmptyState"

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

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const productId = id

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  useEffect(() => {
    if (!loading && product) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [loading, product])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const data = await getProduct(productId)
      setProduct(data)
    } catch (err) {
      setError("Impossible de charger les détails du produit")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!productId) return

    try {
      setDeleting(true)
      safeHaptics.impactAsync("heavy")
      await deleteProduct(productId)
      setDeleteDialogVisible(false)
      safeHaptics.notificationAsync("success")

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
        router.replace("/(tabs)/" as any)
      })
    } catch (err) {
      setError("Impossible de supprimer le produit")
      safeHaptics.notificationAsync("error")
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const handleShare = async () => {
    if (!product) return

    try {
      safeHaptics.impactAsync("light")
      await Share.share({
        title: product.name,
        message: `Découvrez ${product.name} à ${product.price.toFixed(2)}€ - ${product.description}`,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (error || !product) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Erreur"
        description={error || "Produit non trouvé"}
        buttonLabel="Retour"
        onButtonPress={() => router.back()}
      />
    )
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={product.name} />
        <Appbar.Action icon="share-variant" onPress={handleShare} />
        <Link href={`/product/edit/${productId}` as any} asChild>
          <Appbar.Action icon="pencil" />
        </Link>
        <Appbar.Action
          icon="delete"
          onPress={() => {
            setDeleteDialogVisible(true)
            safeHaptics.impactAsync("medium")
          }}
        />
      </Appbar.Header>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.productHeader,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View style={[styles.iconContainer, { transform: [{ rotate: spin }] }]}>
            <MaterialCommunityIcons name="cube" size={60} color={COLORS.primary} />
          </Animated.View>
          <Title style={styles.productTitle}>{product.name}</Title>
        </Animated.View>

        <Animated.View
          style={[
            styles.priceContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.priceTag}>
            <MaterialCommunityIcons name="tag" size={24} color={COLORS.secondary} />
            <Title style={styles.price}>{product.price.toFixed(2)} €</Title>
          </View>
          <Chip style={styles.categoryChip} mode="outlined" icon="shape-outline">
            {product.category}
          </Chip>
        </Animated.View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="text-box-outline" size={24} color={COLORS.primary} />
              <Title style={styles.sectionTitle}>Description</Title>
            </View>
            <Paragraph style={styles.description}>{product.description}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="information-outline" size={24} color={COLORS.primary} />
              <Title style={styles.sectionTitle}>Détails</Title>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="identifier" size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>ID:</Text>
              <Text style={styles.detailValue}>{product.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="shape" size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Catégorie:</Text>
              <Text style={styles.detailValue}>{product.category}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="currency-eur" size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Prix:</Text>
              <Text style={styles.detailValue}>{product.price.toFixed(2)} €</Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.actionsContainer}>
          <Button
            mode="outlined"
            icon="delete"
            onPress={() => {
              setDeleteDialogVisible(true)
              safeHaptics.impactAsync("medium")
            }}
            style={[styles.actionButton, styles.deleteButton]}
            contentStyle={styles.buttonContent}
            textColor={COLORS.error}
          >
            Supprimer
          </Button>
        </View>
      </ScrollView>

      <FAB
        style={styles.deleteFab}
        icon="delete"
        color="white"
        onPress={() => {
          setDeleteDialogVisible(true)
          safeHaptics.impactAsync("medium")
        }}
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Icon icon="alert" size={40} color={COLORS.error} />
          <Dialog.Title style={styles.dialogTitle}>Supprimer le produit</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Êtes-vous sûr de vouloir supprimer <Text style={styles.boldText}>{product.name}</Text>? Cette action est
              irréversible.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Annuler</Button>
            <Button loading={deleting} onPress={handleDelete} textColor={COLORS.error} icon="delete">
              Supprimer
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  productHeader: {
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.surface,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 16,
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginLeft: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.primaryLight,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    marginRight: 8,
    color: COLORS.text,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
    flex: 1,
  },
  actionsContainer: {
    padding: 16,
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  deleteButton: {
    borderColor: COLORS.error,
  },
  buttonContent: {
    height: 48,
  },
  dialogTitle: {
    textAlign: "center",
    color: COLORS.error,
  },
  boldText: {
    fontWeight: "bold",
  },
  deleteFab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.error,
  },
})

