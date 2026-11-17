import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* Contexts */
import { AuthProvider } from "./components/account/AuthContext";
import { MessagesProvider } from "./components/users/MessagesContext";

/* Nav & Footer */
import Nav from "./components/nav/Nav";
import Footer from "./components/footer/Footer";

/* Components */
import Cart from "./components/cart/Cart";

/* Rec */
import StepCounter from "./components/rec/modes/run-main/StepCounter";
import RecordActivity from "./components/rec/record/RecordActivity";
import StepsList from "./components/rec/view-lens/StepsList";
import LensDetails from "./components/rec/view-lens/LensDetails";
import CyclingTracker from "./components/rec/modes/cycling/CyclingTracker";
import WorkoutTracker from "./components/rec/modes/workout/WorkoutTracker";
import TennisTracker from "./components/rec/modes/tennis/TennisTracker";
import KayakingTracker from "./components/rec/modes/kayaking/KayakingTracker";
import HikingTracker from "./components/rec/modes/hiking/HikingTracker";
import WalkingTracker from "./components/rec/modes/walking/WalkingTracker";
import SwimmingTracker from "./components/rec/modes/swimming/SwimmingTracker";
import WinterSportsTracker from "./components/rec/modes/winter-sport/WinterSportsTracker";


/* Main Page (Home) */
import Hero from "./components/pages/home/hero/Hero";
import Shop from "./components/pages/home/shop/Shop";
import ShopPreview from "./components/pages/home/shop/ShopPreview";
import Premium from "./components/pages/premium/Premium";

/* Account Page */
import PersonalAccount from "./components/account/PersonalAccount";


import IntelligencePage from "./components/rec/fitrack-intelligence/IntelligencePage";
import ConquerPage from "./components/rec/conquer/ConquerPage";

import MessagesPage from "./components/messages/MessagesPage";


/* Explore Page */
import Version from "./components/nav/version/Version";
import Terms from "./components/footer/explore/Terms";
import Privacy from "./components/footer/explore/Privacy";
import CookieConsent from "./context/CookieConsent";
import HelpPage from "./components/footer/explore/HelpPage";

/* Search */
import SearchResults from "./components/nav/search/SearchResults";
import ProfilePage from "./components/nav/search/ProfilePage";


/*    Notifications    */
import AdminAnnouncements from "./components/notification/AdminAnnouncements";

/*    Fatcontrol    */
import WeightDashboard from "./components/weightcontrol/WeightDashboard";

/*    Team Races    */
import Races from "./components/pages/races/Races";
import TeamRacesPreview from "./components/pages/home/TeamRacesPreview/TeamRacesPreview";

/*    Runningplans    */
import RunningPlans from "./components/runningplans/RunningPlans";
import RunningPlanHistory from "./components/runningplans/RunningPlanHistory";

/*    Achievements    */
import AchievementsPage from "./components/rec/functional/achievements/AchievementsPage";
import AchievementsPreview from "./components/pages/home/AchievementsPreview/AchievementsPreview";

/*    FiTrack Club    */
import ClubPage from "./components/club/ClubPage";
import NewsPage from "./components/club/news/NewsPage";
import NewsDetails from "./components/club/news/NewsDetails";
import CommunityPage from "./components/club/community/CommunityPage";
import ArticlesPage from "./components/club/articles/ArticlesPage";
import ArticleDetails from "./components/club/articles/ArticleDetails";
import EventsPage from "./components/club/events/EventsPage";
import EventDetails from "./components/club/events/EventDetails";
import NewsPreview from "./components/pages/home/NewsPreview/NewsPreview";

import "./App.scss";

const App = () => {
  return (
    <AuthProvider>
      <MessagesProvider>
        <Router>
          <Nav />
          <CookieConsent />
          <Routes>
            <Route
              path="/"
              element={
                <main className="main">
                  <Hero />
                  <AchievementsPreview />
                  <TeamRacesPreview />
                  {/* <Shop /> */}
                  <ShopPreview />
                  <NewsPreview />
                </main>
              }
            />

            {/* Shop */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/shop" element={<Shop />} />

            {/* Rec */}
            <Route path="/step" element={<RecordActivity />} />
            <Route path="/running" element={<StepCounter />} />
            <Route path="/lens" element={<StepsList />} />
            <Route path="/lens/:id" element={<LensDetails />} />

            <Route path="/cycling" element={<CyclingTracker />} />

            <Route path="/workout" element={<WorkoutTracker />} />

            <Route path="/tennis" element={<TennisTracker />} />

            <Route path="/kayaking" element={<KayakingTracker />} />

            <Route path="/hiking" element={<HikingTracker />} />

            <Route path="/walking" element={<WalkingTracker />} />
            
            <Route path="/swimming" element={<SwimmingTracker />} />
            
            <Route path="/winter-sports" element={<WinterSportsTracker />} />

            {/* Others */}
            <Route path="/premium" element={<Premium />} />
            <Route path="/personal-account" element={<PersonalAccount />} />
            <Route path="/messages" element={<MessagesPage />} />
            

            {/* Explore */}
            <Route path="/info" element={<Version />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/help" element={<HelpPage />} />

            {/* Search */}
            <Route path="/search" element={<SearchResults />} />
            <Route path="/profile/:uid" element={<ProfilePage />} />

            {/* Notifications */}
            <Route
              path="/admin-announcements"
              element={<AdminAnnouncements />}
            />

            {/* weightcontrol */}
            <Route path="/weight-control" element={<WeightDashboard />} />

            {/* races */}
            <Route path="/races" element={<Races />} />
            {/* runningplans */}
            <Route path="/running-plans" element={<RunningPlans />} />
            <Route
              path="/running-plans/history/:planId"
              element={<RunningPlanHistory />}
            />

            {/* achievements */}
            <Route path="/achievements" element={<AchievementsPage />} />


            <Route path="/intelligence" element={<IntelligencePage />} />
            <Route path="/conquer" element={<ConquerPage />} />

            {/* FiTrack club */}
            <Route path="/club" element={<ClubPage />} />
            <Route path="/club/news" element={<NewsPage />} />
            <Route path="/club/news/:newsId" element={<NewsDetails />} />
            <Route path="/club/community" element={<CommunityPage />} />
            <Route path="/club/articles" element={<ArticlesPage />} />
            <Route path="/club/events" element={<EventsPage />} />
            <Route path="/club/events/:eventId" element={<EventDetails />} />
            <Route
              path="/club/articles/:articleId"
              element={<ArticleDetails />}
            />
          </Routes>

          <Footer />
          <ToastContainer
            position="bottom-center"
            autoClose={1500}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            style={{ zIndex: 99999999 }}
            icon={false}
          />
        </Router>
      </MessagesProvider>
    </AuthProvider>
  );
};

export default App;
