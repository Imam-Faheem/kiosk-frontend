import React, { useEffect } from "react";
import {
  Container,
  Paper,
  Button,
  Text,
  Stack,
  Box,
  Grid,
  Image,
  Card,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useLanguageStore from "../stores/languageStore";
import UnoLogo from "../assets/uno.jpg";
import { BUTTON_STYLES, LANGUAGE_OPTIONS } from "../config/constants";

const WelcomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, setLanguage, initializeLanguage } = useLanguageStore();

  // Ensure language is properly initialized
  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  const handleLanguageChange = (value) => {
    setLanguage(value);
  };

  const handleContinue = () => {
    navigate("/home");
  };


  return (
    <Container
      size="lg"
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        style={{
          width: "100%",
          maxWidth: "850px",
          backgroundColor: "#ffffff",
          border: "1px solid #f0f0f0",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
          borderRadius: "24px",
          position: "relative",
          textAlign: "center",
          paddingTop: "100px",
        }}
      >
        {/* ✅ Top-left hotel name */}
        <h2
          style={{
            position: "absolute",
            top: "20px",
            left: "30px",
            fontSize: "30px !important",
            color: "#222",
            fontWeight: "600",
            letterSpacing: "1px",
            marginLeft: "-9px"
          }}
        >
          UNO HOTELS
        </h2>


        {/* ✅ Centered Logo */}
        <img
          src={UnoLogo}
          alt="UNO Hotel Logo"
          style={{
            width: "110px",
            height: "auto",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        />

        {/* ✅ Main heading with dynamic language text */}
        <h3
          style={{
            color: "#333",
            fontSize: "22px",
            marginBottom: "40px",
            fontWeight: "500",
          }}
        >
          {language === "de" && "Sprache wählen"}
          {language === "en" && "Select language"}
          {language === "es" && "Seleccionar idioma"}
          {language === "fr" && "Sélectionner la langue"}
          {language === "it" && "Seleziona lingua"}
          {language === "pt" && "Selecionar idioma"}
        </h3>

        {/* ✅ Language Selection - Centered Grid */}
        <Box 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%',
            marginBottom: '2rem'
          }}
        >
          <Grid gutter="lg" style={{ maxWidth: '600px', width: '100%' }}>
            {LANGUAGE_OPTIONS.map((lang) => (
              <Grid.Col span={6} key={lang.value}>
                <Card
                withBorder
                p="lg"
                radius="lg"
                style={{
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border:
                    language === lang.value
                      ? "3px solid #C8653D"
                      : "2px solid #F2F2F2",
                  backgroundColor:
                    language === lang.value ? "#FFF8F5" : "#FFFFFF",
                  borderRadius: "16px",
                  boxShadow:
                    language === lang.value
                      ? "0 6px 16px rgba(200, 101, 61, 0.2)"
                      : "0 4px 10px rgba(0, 0, 0, 0.08)",
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={() => handleLanguageChange(lang.value)}
              >
                <Stack align="center" gap="md">
                  <Box style={{ position: "relative" }}>
                    <Image
                      src={lang.flag}
                      alt={lang.label}
                      width={120}
                      height={80}
                      radius={0}
                      style={{ objectFit: "cover" }}
                    />
                    {language === lang.value && (
                      <Box
                        style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                          width: "20px",
                          height: "20px",
                          backgroundColor: "#C8653D",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        <IconCheck size={12} />
                      </Box>
                    )}
                  </Box>

                  <Text
                    size="md"
                    fw={600}
                    c={language === lang.value ? "#C8653D" : "#0B152A"}
                    ta="center"
                  >
                    {lang.label}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
          </Grid>
        </Box>

        {/* ✅ Continue Button */}
        <Box ta="center">
          <Button
            size="xl"
            onClick={handleContinue}
            styles={BUTTON_STYLES.primaryRounded}
            uppercase
            radius="xl"
          >
            {t("welcome.continue") || "Continue"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default WelcomePage;
