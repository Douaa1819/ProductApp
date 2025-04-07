import { View, StyleSheet } from "react-native"
import { Text, Button } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { COLORS } from "../constants/theme"

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  buttonLabel?: string
  onButtonPress?: () => void
}

const EmptyState = ({ icon, title, description, buttonLabel, onButtonPress }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={80} color={COLORS.disabled} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {buttonLabel && onButtonPress && (
        <Button mode="contained" onPress={onButtonPress} style={styles.button}>
          {buttonLabel}
        </Button>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: COLORS.text,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 16,
  },
})

export default EmptyState

