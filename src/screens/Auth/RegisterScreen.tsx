import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSignUp } from '@clerk/clerk-expo';
import { AuthStackParamList } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SvgXml } from 'react-native-svg';

const backgroundUri = require('../../assets/images/login-background.png');
const googleIconXml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.5799 12.27C22.5799 11.46 22.5099 10.68 22.3799 9.93H12.2399V14.3H18.1799C17.9199 15.84 17.0699 17.14 15.8199 17.94V20.55H19.5699C21.4699 18.82 22.5799 15.82 22.5799 12.27Z" fill="#4285F4"/>
<path d="M12.2399 23.0001C15.3199 23.0001 17.8999 21.9801 19.5699 20.5501L15.8199 17.9401C14.7999 18.6301 13.6199 19.0501 12.2399 19.0501C9.55992 19.0501 7.24992 17.2201 6.42992 14.7901H2.57992V17.4901C4.24992 20.6901 7.91992 23.0001 12.2399 23.0001Z" fill="#34A853"/>
<path d="M6.42998 14.79C6.20998 14.15 6.08998 13.48 6.08998 12.79C6.08998 12.1 6.20998 11.43 6.42998 10.79V8.09001H2.57998C1.92998 9.38001 1.58998 10.83 1.58998 12.79C1.58998 14.75 1.92998 16.2 2.57998 17.49L6.42998 14.79Z" fill="#FBBC05"/>
<path d="M12.2399 6.53001C13.8499 6.53001 15.0199 7.12001 15.6199 7.68001L19.6499 3.82001C17.8899 2.14001 15.3199 1.00001 12.2399 1.00001C7.91992 1.00001 4.24992 3.31001 2.57992 6.51001L6.42992 9.21001C7.24992 6.78001 9.55992 5.01001 12.2399 5.01001V6.53001Z" fill="#EA4335"/>
</svg>
`;

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Something went wrong');
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      await setActive({ session: completeSignUp.createdSessionId });
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Something went wrong');
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ImageBackground
        source={backgroundUri}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            {pendingVerification ? (
              <>
                <Text style={styles.title}>Verify Your Email</Text>
                <View style={styles.inputGroup}>
                  <TextInput
                    value={code}
                    placeholder="Enter Verification Code"
                    placeholderTextColor="#A9A9A9"
                    onChangeText={setCode}
                    style={[styles.input, { textAlign: 'center' }]}
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity onPress={onPressVerify} style={styles.button}>
                  <Text style={styles.buttonText}>Verify Email</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>Create Account</Text>
                <TouchableOpacity style={styles.socialButton}>
                  <SvgXml xml={googleIconXml} width="24" height="24" />
                  <Text style={styles.socialButtonText}>Sign up with Google</Text>
                </TouchableOpacity>
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or sign up with email</Text>
                  <View style={styles.divider} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="email@address.com"
                    placeholderTextColor="#A9A9A9"
                    onChangeText={setEmailAddress}
                    style={styles.input}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    value={password}
                    placeholder="Password"
                    placeholderTextColor="#A9A9A9"
                    secureTextEntry={true}
                    onChangeText={setPassword}
                    style={[styles.input, styles.passwordInput]}
                  />
                </View>
                <TouchableOpacity onPress={onSignUpPress} style={styles.button}>
                  <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.signInText}>
                    Already have an account? <Text style={{ fontWeight: 'bold' }}>Sign in</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'Work Sans',
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 30,
  },
  socialButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 12,
    fontFamily: 'Work Sans',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dividerText: {
    marginHorizontal: 15,
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 15,
    fontFamily: 'Work Sans',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 12,
    fontFamily: 'Work Sans',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 5,
    height: 60,
    paddingHorizontal: 15,
    fontSize: 16,
    width: '100%',
  },
  passwordInput: {
    backgroundColor: '#F4F4F4',
    borderColor: 'transparent',
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 10,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Work Sans',
  },
  signInText: {
    color: '#000000',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Plus Jakarta Sans',
  },
}); 