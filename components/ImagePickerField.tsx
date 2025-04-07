
import { useState } from "react"
import { View, StyleSheet, Image, TouchableOpacity } from "react-native"
import { Text, Button, Portal, Dialog, HelperText } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useImagePicker } from "../hooks/useImagePicker"
import { COLORS } from "../constants/theme"

interface ImagePickerFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

const ImagePickerField = ({ value, onChange, error }: ImagePickerFieldProps) => {
  const { loading, pickImage, takePhoto } = useImagePicker()
  const [dialogVisible, setDialogVisible] = useState(false)

  const handlePickImage = async () => {
    try {
      const imageUri = await pickImage()
      if (imageUri) {
        onChange(imageUri)
      }
    } catch (err) {
      console.error("Erreur lors de la sélection d'image:", err)
    } finally {
      setDialogVisible(false)
    }
  }

  const handleTakePhoto = async () => {
    try {
      const imageUri = await takePhoto()
      if (imageUri) {
        onChange(imageUri)
      }
    } catch (err) {
      console.error("Erreur lors de la prise de photo:", err)
    } finally {
      setDialogVisible(false)
    }
  }

  const handleRemoveImage = () => {
    onChange("")
    setDialogVisible(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Image du produit (optionnelle)</Text>

      <TouchableOpacity
        style={[styles.imagePicker, !!error && styles.errorBorder]}
        onPress={() => setDialogVisible(true)}
        activeOpacity={0.7}
      >
        {value ? (
          <Image source={{ uri: value }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons name="image-plus" size={40} color={COLORS.disabled} />
            <Text style={styles.placeholderText}>Ajouter une image (optionnel)</Text>
          </View>
        )}
      </TouchableOpacity>

      {error && <HelperText type="error">{error}</HelperText>}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Choisir une image</Dialog.Title>
          <Dialog.Content>
            <Text>Comment souhaitez-vous ajouter une image ?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Annuler</Button>
            {value && <Button onPress={handleRemoveImage}>Supprimer</Button>}
            <Button onPress={handlePickImage} loading={loading}>
              Galerie
            </Button>
            <Button onPress={handleTakePhoto} loading={loading}>
              Appareil photo
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: COLORS.text,
  },
  imagePicker: {
    height: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  placeholderText: {
    marginTop: 8,
    color: COLORS.textSecondary,
  },
})

export default ImagePickerField

