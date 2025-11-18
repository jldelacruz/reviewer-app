import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Text, FAB } from "react-native-paper";

const ReviewersScreen = () => {
    const navigation = useNavigation();

    return(
        <>
            <Text>Reviewers</Text>
             <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate('CreateReviewer')}
            />
        </>
    );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
})

export default ReviewersScreen;