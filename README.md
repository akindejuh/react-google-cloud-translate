# Google Translation Package for React
A translation package built using Google Translation API for React.

## Installation
```bash
npm install react-google-cloud-translate
```
or
```bash
yarn add react-google-cloud-translate
```

## Usage
Wrap your application with the `GoogleTranslateProvider` component.

```tsx
import { GoogleTranslateProvider } from 'react-google-cloud-translate';

const App = () => {
  return (
    <GoogleTranslateProvider language="rw" google_api_key="your_api_key">
      {/* rest of your application */}
    </GoogleTranslateProvider>
  );
};

export default App;
```

## Translating Text
Use the useTranslation hook to access the googleTranslate function and translate text in your components.

```tsx
import { useTranslation } from 'react-google-cloud-translate';

const App = () => {
  const { googleTranslate } = useGoogleTranslate();
  
  return (
    <h1>{googleTranslate('hello')}</h1>
  );
};

export default App;
```

## Bulk Text Translation
- Import the GoogleTranslateClient class and instantiate it with your credentials
- Call the bulkGoogleTranslate function to translate multiple texts at once by passing an array of strings.

```tsx
import { GoogleTranslateClient } from 'react-google-cloud-translate';

const App = () => {
  const googleTranslateClient = new GoogleTranslateClient({
    google_api_key: "",
    language_target: ""
  });

  const translateTexts = async () => {
    const translations = await googleTranslateClient.bulkGoogleTranslate(['hello', 'world']);
    console.log({ translations });
  };

  useEffect(() => {
    translateTexts();
  }, []);
  
  return (
    <h1>hello</h1>
  );
};

export default App;
```
