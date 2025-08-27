import { msToMinutes } from '../utils/time.js';

export class SettingsDraftBuilder {
  static generateSettingsDTO(config , source , isSettingsActive) {
    const dto = { isSettingsActive };

    for (const key in config) {
      const value = isSettingsActive ?
                    source[key]?.value ?? config[key].default
                                     : key === 'gameTime'
                                       ? msToMinutes(source[key])
                                       : source[key];

      dto[key] = {
        ...config[key] ,
        value ,
        selectedKey: source[key]?.selectedKey ?? config[key].default
      };
    }

    return dto;
  }

  static finalizeSettings(draft) {
    const result = {};

    for (const key in draft) {
      if (key !== 'isSettingsActive') {
        result[key] = draft[key].value;
      }
    }
    return result;
  }

}