

import { useState, useCallback } from "react"
import { View, FlatList, StyleSheet, RefreshControl } from "react-native"
import { Appbar, Searchbar, Chip, FAB, ActivityIndicator } from "react-native-paper"
import { useRouter } from "expo-router"
import { getProducts } from "../../services/product-service"
import type { Product } from "../../types/product"
import ProductItem from "../../components/ProductItem"
import EmptyState from "@/components/EmptyState"
import { COLORS } from "@/constants/theme"
import { useFocusEffect } from "@react-navigation/native"

export default function ProductListScreen() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterMenuVisible, setFilterMenuVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const categories = ["Électronique", "Vêtements", "Livres", "Maison", "Tous"]

  useFocusEffect(
    useCallback(() => {
      loadProducts()
    }, []),
  )

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProducts()
      setProducts(data)

      if (selectedCategory && selectedCategory !== "Tous") {
        const filtered = data.filter((product) => product.category.toLowerCase() === selectedCategory.toLowerCase())
        setFilteredProducts(filtered)
      } else {
        setFilteredProducts(data)
      }

      if (searchQuery) {
        handleSearch(searchQuery)
      }
    } catch (err) {
      setError("Impossible de charger les produits")
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadProducts()
  }

  const handleCategoryFilter = (category: string) => {
    setFilterMenuVisible(false)

    try {
      if (category === "Tous") {
        setSelectedCategory(null)
        setFilteredProducts(products)
      } else {
        setSelectedCategory(category)
        const filteredData = products.filter((product) => product.category.toLowerCase() === category.toLowerCase())
        setFilteredProducts(filteredData)
      }
    } catch (err) {
      setError("Impossible de filtrer les produits")
      console.error(err)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      if (selectedCategory && selectedCategory !== "Tous") {
        const filtered = products.filter((product) => product.category.toLowerCase() === selectedCategory.toLowerCase())
        setFilteredProducts(filtered)
      } else {
        setFilteredProducts(products)
      }
      return
    }

    const lowercaseQuery = query.toLowerCase()
    let filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery),
    )

    if (selectedCategory && selectedCategory !== "Tous") {
      filtered = filtered.filter((product) => product.category.toLowerCase() === selectedCategory.toLowerCase())
    }

    setFilteredProducts(filtered)
  }

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )
    }

    if (error) {
      return (
        <EmptyState
          icon="alert-circle-outline"
          title="Erreur"
          description={error}
          buttonLabel="Réessayer"
          onButtonPress={loadProducts}
        />
      )
    }

    if (searchQuery || selectedCategory) {
      return (
        <EmptyState
          icon="magnify-close"
          title="Aucun résultat"
          description="Aucun produit ne correspond à votre recherche. Essayez avec d'autres critères."
          buttonLabel="Effacer les filtres"
          onButtonPress={() => {
            setSearchQuery("")
            setSelectedCategory(null)
            setFilteredProducts(products)
          }}
        />
      )
    }

    return (
      <EmptyState
        icon="package-variant-closed"
        title="Aucun produit"
        description="Vous n'avez pas encore ajouté de produits. Commencez par en ajouter un !"
        buttonLabel="Ajouter un produit"
        onButtonPress={() => router.push("/product/new" as any)}
      />
    )
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Produits" />
        <Appbar.Action
          icon="filter-variant"
          onPress={() => setFilterMenuVisible(!filterMenuVisible)}
          color={selectedCategory ? COLORS.primary : undefined}
        />
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Rechercher un produit..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />
      </View>

      {filterMenuVisible && (
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Chip
                selected={selectedCategory === item || (item === "Tous" && !selectedCategory)}
                onPress={() => handleCategoryFilter(item)}
                style={styles.categoryChip}
                selectedColor={COLORS.primary}
                mode="outlined"
              >
                {item}
              </Chip>
            )}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      )}

      {filteredProducts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item, index }) => (
            <ProductItem
              product={item}
              onPress={() => {
                router.push(`/(tabs)/product/${item.id}` as any)
              }}
              index={index}
            />
          )}
          keyExtractor={(item) => item.id || ""}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        color="white"
        onPress={() => {
          router.push("/product/new" as any)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  searchbar: {
    elevation: 2,
    backgroundColor: COLORS.surface,
  },
  categoriesContainer: {
    backgroundColor: COLORS.surface,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  list: {
    padding: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

