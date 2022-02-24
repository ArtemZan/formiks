import React from "react";
import { Stack, Text, Button } from "@chakra-ui/react";

export default function CookiePreference(props: any) {
  return (
    <Stack
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      width="90%"
      p="6"
      boxShadow="lg"
      bg="white"
      ml="auto"
      mr="auto"
      mb={"3vh"}
      borderRadius="md"
      zIndex={10000}
    >
      <Stack direction="row" alignItems="center">
        <Text fontWeight="semibold">Your Privary</Text>
      </Stack>

      <Stack
        direction={{ base: "column", md: "row" }}
        justifyContent="space-between"
      >
        <Text fontSize={{ base: "sm" }} textAlign={"left"} maxW={"6xl"}>
          We use cookies and similar technologies to help personalise content
          and provide a better experience. By clicking OK or turning an option
          on in Cookie Preferences, you agree to this, as outlined in our Cookie
          Policy. To change preferences or withdraw consent, please update your
          Cookie Preferences.
        </Text>
        <Stack direction={{ base: "column", md: "row" }}>
          <Button variant="outline" colorScheme="twitter">
            Cookie Preferences
          </Button>
          <Button
            color={"white"}
            bg={"blue.400"}
            _hover={{
              bg: "blue.300",
            }}
            onClick={() => {
              props.onAllow();
              localStorage.setItem("cookieConsent", "allowed");
            }}
          >
            Allow
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
