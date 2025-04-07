

import { useRef, useEffect } from "react"
import { View, StyleSheet, TouchableOpacity, Animated, Image } from "react-native"
import { Text, Surface, Badge } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { COLORS } from "../constants/theme"
import type { Product } from "../types/product"

interface ProductItemProps {
  product: Product
  onPress: () => void
  index?: number
}

const ProductItem = ({ product, onPress, index = 0 }: ProductItemProps) => {
  if (!product) {
    return null 
  }

  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(50)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, translateY, index])

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <Surface style={styles.surface}>
          <View style={styles.content}>
            <View style={styles.imageContainer}>
              {product.imageUrl ? (
                <Image source={{ uri: product.imageUrl }} style={styles.image} />
              ) : (
                <View style={styles.placeholderImage}>
                  <MaterialCommunityIcons name="image-outline" size={32} color={COLORS.disabled} />
                </View>
              )}
            </View>
            <View style={styles.details}>
              <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                {product.name}
              </Text>
              <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
                {product.description}
              </Text>
              <View style={styles.footer}>
                <Badge style={styles.category}>{product.category}</Badge>
                <Text style={styles.price}>{product.price.toFixed(2)} €</Text>
              </View>
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  surface: {
    borderRadius: 12,
    elevation: 2,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 100,
    height: 100,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    flex: 1,
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: COLORS.text,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primaryDark,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.secondary,
  },
})

export default ProductItem

