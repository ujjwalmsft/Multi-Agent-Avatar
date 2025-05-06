import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { avatarAppConfig } from "./ttsConfig";


export const createAvatarSynthesizer = (): SpeechSDK.AvatarSynthesizer => {
    const { cogSvcSubKey, cogSvcRegion, voiceName, avatarCharacter, avatarStyle, avatarBackgroundColor } = avatarAppConfig;
  
    const speechSynthesisConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKey, cogSvcRegion);
    speechSynthesisConfig.speechSynthesisVoiceName = voiceName;
  
    const videoFormat = new SpeechSDK.AvatarVideoFormat();
    videoFormat.setCropRange(
      new SpeechSDK.Coordinate(600, 50),
      new SpeechSDK.Coordinate(1320, 1080)
    );
  
    const avatarConfig = new SpeechSDK.AvatarConfig(avatarCharacter, avatarStyle, videoFormat);
    avatarConfig.backgroundColor = avatarBackgroundColor;
  
    return new SpeechSDK.AvatarSynthesizer(speechSynthesisConfig, avatarConfig);
  };