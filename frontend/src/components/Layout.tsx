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
  AspectRatio,
  useDisclosure,
  Link,
  Image,
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
  Tooltip,
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
import { FiChevronDown } from "react-icons/all";
import logo from "../logo.png";
import CookiePreference from "./AllowCookies";
import { msalInstance } from "../index";
import { RestAPI } from "../api/rest";
import NavItem from "rsuite/esm/Nav/NavItem";

interface LayoutProps {
  onRolesChange: (roles: string[]) => void;
  children: React.ReactNode;
}

function Layout(props: LayoutProps) {
  const { instance } = useMsal();

  const [cookieConsent, setCookieConsent] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const isAuthenticated = useIsAuthenticated();
  const history = useHistory();
  const [navItemsCurrent, setNavItemsCurrent] = useState<NavItem[]>([]);
  useEffect(() => {
    if (localStorage.getItem("cookieConsent") === "allowed") {
      setCookieConsent(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    async function fetchRolesAndSetNavItems() {
      const response = await RestAPI.getRoles();
      props.onRolesChange(response.data);
      const sortedRoles = response.data.sort();
      setRoles(sortedRoles);
      let newNavItemsCurrent: NavItem[] = [];
      if (sortedRoles.includes("Administrator")) {
        newNavItemsCurrent = NAV_ITEMS;
      } else if (sortedRoles.includes("Marketing")) {
        newNavItemsCurrent = NAV_ITEMS;
      } else if (sortedRoles.includes("Accounting")) {
        newNavItemsCurrent = NAV_ITEMS.filter(
          (item) => item.label !== "Request Forms" && item.label !== "Dropdowns"
        );
      } else if (sortedRoles.includes("Management")) {
        newNavItemsCurrent = NAV_ITEMS.filter(
          (item) => item.label !== "Request Forms" && item.label !== "Dropdowns"
        );
      } else {
        newNavItemsCurrent = []; // or some default value
      }
      setNavItemsCurrent(newNavItemsCurrent);
    }

    fetchRolesAndSetNavItems();
  }, []);

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
          bg={useColorModeValue("white", "#4b4b4b")}
          color={useColorModeValue("gray.600", "#9b9b9b")}
          minH={"60px"}
          py={{ base: 2 }}
          px={{ base: 4 }}
          borderBottom={1}
          borderStyle={"solid"}
          borderColor={useColorModeValue("gray.200", "#000000")}
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
            <Image
              mt={"2px"}
              ml={{ base: "0", md: "10px" }}
              src={logo}
              alt="Formiks Logo"
              width={["50%", "40%", "30%"]} // Responsive widths based on breakpoints
              minWidth="70px" // Set a minimum width so it doesn't get too small
              maxWidth="300px" // Set a maximum width so it doesn't get too large
              cursor="pointer"
              onClick={() => {
                history.push("/submissions");
              }}
            />

            <Flex display={{ base: "none", md: "flex" }} ml={10}>
              <DesktopNav navItemsCurrent={navItemsCurrent} />
            </Flex>
          </Flex>

          <Stack
            flex={{ base: 1, md: 1 }}
            justify={"flex-end"}
            direction={"row"}
            spacing={6}
          >
            <AuthenticatedTemplate>
              <Menu>
                <MenuButton>
                  <HStack>
                    <Avatar
                      name={msalInstance.getActiveAccount()?.name}
                      mr={"10px"}
                      size={"sm"}
                    />
                    <VStack
                      display={{ base: "none", md: "flex" }}
                      alignItems="flex-start"
                      spacing="1px"
                      ml={{ base: 0, md: "2" }}
                    >
                      <Text
                        color={useColorModeValue("gray.800", "#ABB2BF")}
                        fontWeight={500}
                        fontSize="sm"
                      >
                        {msalInstance.getActiveAccount()?.name}
                      </Text>

                      <Text fontSize="xs" color="gray.500">
                        <Tooltip hasArrow label="Settings">
                          {roles.join(", ")}
                        </Tooltip>
                      </Text>
                    </VStack>
                    <Box display={{ base: "none", md: "flex" }}>
                      <FiChevronDown style={{ marginLeft: "5px" }} />
                    </Box>
                  </HStack>
                </MenuButton>

                <MenuList
                  m={0}
                  mr={-3.0}
                  bg={useColorModeValue("white", "#21252A")}
                  borderColor={useColorModeValue("gray.200", "#21252A")}
                  boxShadow="none"
                  zIndex={2000000}
                >
                  <MenuGroup title="Profile">
                    <MenuItem isDisabled onClick={() => {}}>
                      My Account
                    </MenuItem>
                  </MenuGroup>
                  <MenuDivider />
                  <MenuGroup title="Help">
                    <MenuItem onClick={() => {}}>Documentation</MenuItem>
                    <MenuItem
                      onClick={() => {
                        window.open(
                          `mailto:sk@innovatio.lv,sp@innovatio.lv?subject=Formiks Bug Report&body=Hello! I found the bug while using: ${window.location.href}`,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                    >
                      Report a Bug
                    </MenuItem>
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
                bg={useColorModeValue("blue.400", "#4D97E2")}
                _hover={{
                  bg: useColorModeValue("blue.300", "#377bbf"),
                }}
                onClick={async () => {
                  // history.push("/login");
                  await instance.loginRedirect();
                  // await instance.acquireTokenPopup({
                  //   ...loginRequest,
                  //   account: instance.getActiveAccount()!,
                  // });
                  // await instance.loginPopup();
                }}
              >
                Sign In
              </Button>
            </UnauthenticatedTemplate>
          </Stack>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <MobileNav closeMenu={onToggle} navItemsCurrent={navItemsCurrent} />
        </Collapse>
      </Box>
      <Box m={{ base: "1em", xl: "5em" }} mt={{ base: "3em", xl: "5em" }}>
        {children}
      </Box>
    </Box>
  );
}

const DesktopNav = ({ navItemsCurrent }: { navItemsCurrent: NavItem[] }) => {
  const history = useHistory();
  const linkColor = useColorModeValue("gray.600", "#ABB2BF");
  const linkHoverColor = useColorModeValue("gray.800", "white");
  const popoverContentBgColor = useColorModeValue("white", "#21252A");

  return (
    <Stack direction={"row"} spacing={4}>
      {navItemsCurrent.map((navItem: NavItem) => {
        return (
          <Box key={navItem.label}>
            <Popover trigger={"hover"} placement={"bottom-start"}>
              {({ isOpen, onClose }) => (
                <>
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
                          <DesktopSubNav
                            onClose={onClose}
                            key={child.label}
                            {...child}
                          />
                        ))}
                      </Stack>
                    </PopoverContent>
                  )}
                </>
              )}
            </Popover>
          </Box>
        );
      })}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel, onClose }: NavItem) => {
  const history = useHistory();
  return (
    <Link
      onClick={() => {
        if (href) {
          history.push(href);
          if (onClose) {
            onClose();
          }
        }
      }}
      role={"group"}
      display={"block"}
      p={2}
      rounded={"md"}
      _hover={{ bg: useColorModeValue("blue.50", "#1d2024") }}
    >
      <Stack direction={"row"} align={"center"}>
        <Box>
          <Text
            transition={"all .3s ease"}
            _groupHover={{ color: useColorModeValue("blue.400", "#cacfd9") }}
            fontWeight={600}
            fontSize="md"
            ml={2}
          >
            {label}
          </Text>
          <Text
            ml={2}
            fontSize={"sm"}
            color={useColorModeValue("#4A5667", "#718196")}
          >
            {subLabel}
          </Text>
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
          <Icon
            color={useColorModeValue("blue.400", "#cacfd9")}
            w={5}
            h={5}
            as={ChevronRightIcon}
          />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = (props: any) => {
  return (
    <Stack
      bg={useColorModeValue("white", "#21252A")}
      p={4}
      display={{ md: "none" }}
    >
      {NAV_ITEMS.map((navItem) => (
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
  onClose?: any;
  isAdmin?: boolean;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: "Request Forms",
    children: [
      {
        label: "Request Forms",
        subLabel: "Explore existing request forms",
        href: "/projects",
      },
      {
        label: "New Request Form",
        subLabel: "Create new request form",
        href: "/projects/create",
      },
      {
        label: "Drafts",
        subLabel: "Explore unpublished projects",
        href: "/drafts",
      },
    ],
  },

  {
    label: "Projects",
    children: [
      {
        label: "Projects Table",
        subLabel: "Explore all active projects",
        href: "/submissions",
      },
    ],
  },
  {
    label: "Reports",
    children: [
      {
        label: "Marketing Income PA Allocation Report",
        subLabel: "Explore all reports",
        href: "/reports",
      },
    ],
  },
  {
    label: "Dropdowns",
    children: [
      {
        label: "Existing Dropdowns",
        subLabel: "Explore existing adaptive dropdowns",
        href: "/dropdowns",
      },
      {
        label: "New Dropdown",
        subLabel: "Create new adaptive dropdown",
        href: "/dropdowns/create",
        isAdmin: true,
      },
    ],
  },
];

export default Layout;
