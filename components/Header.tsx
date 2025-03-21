import { useState } from 'react'
import { useEffect } from 'react';
import { getPageTitle } from '../utils/pageTitle';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Button,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import ChatIcon from '@mui/icons-material/Chat'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'

const publicMenuItems = [
  { text: 'Home', path: '/', icon: <HomeIcon /> },
]

const permissionBasedItems = [
  { 
    text: 'Search', 
    path: '/search',
    icon: <SearchIcon />, 
    requiredPermission: 'canSearch'
  },
  { 
    text: 'Chat', 
    path: '/chat', 
    icon: <ChatIcon />,
    requiredPermission: 'canChat'
  },
  { 
    text: 'Age Predictor', 
    path: '/age', 
    icon: <PersonIcon />,
    requiredPermission: 'canPredict'
  },
]

export default function Header() {
  const { data: session } = useSession()
  const permissions = session?.user?.permissions || {}
  const router = useRouter()
  const pathname = usePathname()
  console.log('Header - pathname:', pathname)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const availableMenuItems = [
    ...publicMenuItems,
    ...permissionBasedItems.filter(item => 
      permissions[item.requiredPermission as keyof typeof permissions]
    )
  ]

  const handleNavigate = (path: string) => {
    router.push(path)
    setDrawerOpen(false)
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }
  useEffect(() => {
    console.log('Header useEffect - pathname:', pathname)
    const pagetitle=getPageTitle(pathname);
    document.title = pagetitle
  }, [pathname]);

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Assistant
          </Typography>
          
          {session ? (
            <>
              <IconButton
                onClick={handleMenuClick}
                size="small"
                sx={{ ml: 2 }}
              >
                <Avatar
                  alt={session.user?.name ?? ''}
                  src={session.user?.image ?? ''}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
              >
                <MenuItem disabled>
                  {session.user?.name}
                </MenuItem>
                <MenuItem onClick={() => signOut()}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button 
              color="inherit" 
              onClick={() => signIn('google')}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {availableMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={pathname === item.path}
                  onClick={() => handleNavigate(item.path)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  )
}