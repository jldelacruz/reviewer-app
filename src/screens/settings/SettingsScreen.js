import { useNavigation } from "@react-navigation/native";

import { Text, IconButton } from "react-native-paper";

const SettingsScreen = () => {
    return(
        <>
            <Text>Settings</Text>
            <IconButton
                icon="camera"
                size={20}
                onPress={() => console.log('Pressed')}
            />
        </>
    );
}

export default SettingsScreen;