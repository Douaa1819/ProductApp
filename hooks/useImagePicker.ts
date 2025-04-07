

import { useState } from "react"
import * as ImagePicker from "expo-image-picker"
import { Platform } from "react-native"

export const useImagePicker = () => {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      try {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (cameraStatus !== "granted" || libraryStatus !== "granted") {
          setError("Nous avons besoin des permissions pour accéder à la caméra et à la galerie")
          return false
        }
        return true
      } catch (err) {
        console.error("Erreur lors de la demande de permissions:", err)
        return false
      }
    }
    return true
  }

  const pickImage = async () => {
    try {
      setLoading(true)
      setError(null)

      const hasPermission = await requestPermissions()
      if (!hasPermission) {
        setLoading(false)
        return null
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri)
        return result.assets[0].uri
      }

      return null
    } catch (err) {
      setError("Une erreur est survenue lors de la sélection de l'image")
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const takePhoto = async () => {
    try {
      setLoading(true)
      setError(null)

      const hasPermission = await requestPermissions()
      if (!hasPermission) {
        setLoading(false)
        return null
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri)
        return result.assets[0].uri
      }

      return null
    } catch (err) {
      setError("Une erreur est survenue lors de la prise de photo")
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const resetImage = () => {
    setImage(null)
    setError(null)
  }

  return {
    image,
    loading,
    error,
    pickImage,
    takePhoto,
    resetImage,
    setImage,
  }
}

