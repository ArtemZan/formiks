import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Link,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuGroup,
  MenuItem,
  MenuDivider,
  HStack,
  VStack,
  useColorMode,
  Center,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";
import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useIsAuthenticated,
  useMsal,
} from "@azure/msal-react";
import { FaUserCircle, FiChevronDown } from "react-icons/all";
import CookiePreference from "./AllowCookies";
import { msalInstance } from "../index";
import { InteractionStatus } from "@azure/msal-browser";
import { getUserPhoto } from "../utils/MsGraphApiCall";

function Layout(props: any) {
  const { instance, inProgress } = useMsal();

  const [userPhoto, setUserPhoto] = useState<undefined | string>(undefined);
  const [cookieConsent, setCookieConsent] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const history = useHistory();

  useEffect(() => {
    if (localStorage.getItem("cookieConsent") === "allowed") {
      setCookieConsent(true);
    }
  }, []);

  useEffect(() => {
    if (
      isAuthenticated &&
      !userPhoto &&
      inProgress === InteractionStatus.None
    ) {
      getUserPhoto().then((response) => setUserPhoto(response));
    }
  }, [inProgress, userPhoto, instance, isAuthenticated]);

  const { children } = props;
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box minH="100vh">
      {!cookieConsent ? (
        <CookiePreference
          onAllow={() => {
            setCookieConsent(true);
            localStorage.setItem("cookieConsent", "allowed");
          }}
        />
      ) : null}

      <Box>
        <Flex
          bg={useColorModeValue("white", "gray.800")}
          color={useColorModeValue("gray.600", "white")}
          minH={"60px"}
          py={{ base: 2 }}
          px={{ base: 4 }}
          borderBottom={1}
          borderStyle={"solid"}
          borderColor={useColorModeValue("gray.200", "gray.900")}
          align={"center"}
        >
          <Flex
            flex={{ base: 1, md: "auto" }}
            ml={{ base: -2 }}
            display={{ base: "flex", md: "none" }}
          >
            <IconButton
              onClick={onToggle}
              icon={
                isOpen ? (
                  <CloseIcon w={3} h={3} />
                ) : (
                  <HamburgerIcon w={5} h={5} />
                )
              }
              variant={"ghost"}
              aria-label={"Toggle Navigation"}
            />
          </Flex>
          <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
            <Text
              mt={"2px"}
              ml={{ base: "0", md: "10px" }}
              textAlign={useBreakpointValue({ base: "center", md: "left" })}
              fontFamily={"heading"}
              fontWeight="bold"
              color={useColorModeValue("gray.800", "white")}
              cursor="pointer"
              onClick={() => {
                history.push("/");
              }}
              fontSize="lg"
            >
              Formiks
            </Text>

            <Flex display={{ base: "none", md: "flex" }} ml={10}>
              <DesktopNav />
            </Flex>
          </Flex>

          <Stack
            flex={{ base: 1, md: 1 }}
            justify={"flex-end"}
            direction={"row"}
            spacing={6}
          >
            {/* <Button variant="ghost" onClick={toggleColorMode}>
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button> */}
            <AuthenticatedTemplate>
              <Menu>
                <MenuButton>
                  <HStack>
                    <Avatar src={userPhoto} mr={"10px"} size={"sm"} />
                    <VStack
                      display={{ base: "none", md: "flex" }}
                      alignItems="flex-start"
                      spacing="1px"
                      ml={{ base: 0, md: "2" }}
                    >
                      <Text
                        color={useColorModeValue("gray.800", "gray.200")}
                        fontWeight={500}
                        fontSize="sm"
                      >
                        {isAuthenticated
                          ? msalInstance.getActiveAccount()?.name
                          : null}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        administrator
                      </Text>
                    </VStack>
                    <Box display={{ base: "none", md: "flex" }}>
                      <FiChevronDown style={{ marginLeft: "5px" }} />
                    </Box>
                  </HStack>
                </MenuButton>
                <MenuList boxShadow="none" zIndex={2000000}>
                  <MenuGroup title="Profile">
                    <MenuItem onClick={() => {}}>My Account</MenuItem>
                  </MenuGroup>
                  <MenuDivider />
                  <MenuGroup title="Help">
                    <MenuItem onClick={() => {}}>Documentation</MenuItem>
                    <MenuItem>Report a Bug</MenuItem>
                  </MenuGroup>
                  <MenuDivider />
                  <MenuItem
                    onClick={async () => {
                      // instance.logout();
                      sessionStorage.clear();
                      setTimeout(() => {
                        window.location.href = "/";
                      }, 1000);
                    }}
                  >
                    Log Out
                  </MenuItem>
                </MenuList>
              </Menu>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
              <Button
                fontSize={"sm"}
                fontWeight={600}
                color={"white"}
                bg={"blue.400"}
                onClick={() => {
                  // history.push("/login");
                  instance.loginPopup();
                }}
                _hover={{
                  bg: "blue.300",
                }}
              >
                Sign In
              </Button>
            </UnauthenticatedTemplate>
          </Stack>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <MobileNav closeMenu={onToggle} />
        </Collapse>
      </Box>
      <Box m={{ base: "1em", xl: "5em" }} mt={{ base: "3em", xl: "5em" }}>
        {children}
      </Box>
    </Box>
  );
}

const DesktopNav = () => {
  const history = useHistory();
  const linkColor = useColorModeValue("gray.600", "gray.200");
  const linkHoverColor = useColorModeValue("gray.800", "white");
  const popoverContentBgColor = useColorModeValue("white", "gray.800");
  const isAuthenticated = useIsAuthenticated();

  return (
    <Stack direction={"row"} spacing={4}>
      {(isAuthenticated ? NAV_ITEMS : GUEST_NAV_ITEMS).map((navItem) => {
        return (
          <Box key={navItem.label}>
            <Popover trigger={"hover"} placement={"bottom-start"}>
              <PopoverTrigger>
                <Button
                  variant="link"
                  p={2}
                  onClick={() => {
                    if (navItem.href) {
                      history.push(navItem.href);
                    }
                  }}
                  fontSize={"sm"}
                  fontWeight={500}
                  color={linkColor}
                  _hover={{
                    textDecoration: "none",
                    color: linkHoverColor,
                  }}
                >
                  {navItem.label}
                </Button>
              </PopoverTrigger>

              {navItem.children && (
                <PopoverContent
                  border={0}
                  boxShadow={"xl"}
                  bg={popoverContentBgColor}
                  p={4}
                  rounded={"xl"}
                  minW={"sm"}
                  mt={"20px"}
                >
                  <Stack>
                    {navItem.children.map((child) => (
                      <DesktopSubNav key={child.label} {...child} />
                    ))}
                  </Stack>
                </PopoverContent>
              )}
            </Popover>
          </Box>
        );
      })}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  const history = useHistory();
  return (
    <Link
      onClick={() => {
        if (href) {
          history.push(href);
        }
      }}
      role={"group"}
      display={"block"}
      p={2}
      rounded={"md"}
      _hover={{ bg: useColorModeValue("blue.50", "gray.900") }}
    >
      <Stack direction={"row"} align={"center"}>
        <Box>
          <Text
            transition={"all .3s ease"}
            _groupHover={{ color: "blue.400" }}
            fontWeight={600}
            fontSize="md"
          >
            {label}
          </Text>
          <Text fontSize={"sm"}>{subLabel}</Text>
        </Box>
        <Flex
          transition={"all .3s ease"}
          transform={"translateX(-10px)"}
          opacity={0}
          _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
          justify={"flex-end"}
          align={"center"}
          flex={1}
        >
          <Icon color={"blue.400"} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = (props: any) => {
  const isAuthenticated = useIsAuthenticated();
  return (
    <Stack
      bg={useColorModeValue("white", "gray.800")}
      p={4}
      display={{ md: "none" }}
    >
      {(isAuthenticated ? NAV_ITEMS : GUEST_NAV_ITEMS).map((navItem) => (
        <MobileNavItem
          closeMenu={props.closeMenu}
          key={navItem.label}
          {...navItem}
        />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href, closeMenu }: any) => {
  const history = useHistory();
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        onClick={() => {
          if (href) {
            history.push(href);
          }
        }}
        justify={"space-between"}
        align={"center"}
        _hover={{
          textDecoration: "none",
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue("gray.600", "gray.200")}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={"all .25s ease-in-out"}
            transform={isOpen ? "rotate(180deg)" : ""}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={useColorModeValue("gray.200", "gray.700")}
          align={"start"}
        >
          {children &&
            children.map((child: any) => (
              <Link
                key={child.label}
                py={2}
                onClick={() => {
                  if (child.href) {
                    history.push(child.href);
                    closeMenu();
                  }
                }}
              >
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: "Dashboard",
    href: "/",
  },
  {
    label: "Projects",
    children: [
      {
        label: "Existing Projects",
        subLabel: "Explore existing formiks projects",
        href: "/projects",
      },
      {
        label: "New Project",
        subLabel: "Create new formiks project",
        href: "/projects/create",
      },
    ],
  },

  {
    label: "Submissions",
    children: [
      {
        label: "Classic Viewer",
        subLabel: "Default submission explorer and viewer",
        href: "/submissions",
      },
      {
        label: "Table Viewer",
        subLabel: "Filter and sort submissions with table view",
        href: "/submissions",
      },
    ],
  },

  {
    label: "Dropdowns",
    href: "/dropdowns",
  },
  {
    label: "Pipelines",
    href: "/pipelines",
  },
];
const GUEST_NAV_ITEMS: Array<NavItem> = [
  {
    label: "Dashboard",
    href: "/",
  },
  {
    label: "Projects",
    href: "/projects",
  },
  {
    label: "Documentation",
    href: "/documentation",
  },
];

export default Layout;
