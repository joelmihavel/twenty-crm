import { AppRouterProviders } from '@/app/components/AppRouterProviders';
import { LazyRoute } from '@/app/components/LazyRoute';
import { SettingsRoutes } from '@/app/components/SettingsRoutes';
import { VerifyLoginTokenEffect } from '@/auth/components/VerifyLoginTokenEffect';

import { VerifyEmailEffect } from '@/auth/components/VerifyEmailEffect';
import indexAppPath from '@/navigation/utils/indexAppPath';
import { BlankLayout } from '@/ui/layout/page/components/BlankLayout';
import { DefaultLayout } from '@/ui/layout/page/components/DefaultLayout';
import { AppPath } from 'twenty-shared/types';

import { lazy } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from 'react-router-dom';
import { HawkeyeDashboard } from '@/hawkeye/components/HawkeyeDashboard';
import { HawkeyeGlobalSearch } from '@/hawkeye/components/HawkeyeGlobalSearch';
import { HawkeyeActivityFeed } from '@/hawkeye/components/HawkeyeActivityFeed';
import { HawkeyeSettings } from '@/hawkeye/components/HawkeyeSettings';
import { HawkeyeLayout } from '@/hawkeye/components/HawkeyeLayout';
import { HawkeyeProviders } from '@/hawkeye/components/HawkeyeProviders';
import {
  TenantsListPage,
  TenantDetailPage,
  MerchantsListPage,
  MerchantDetailPage,
  VendorsListPage,
  VendorDetailPage,
  PropertiesListPage,
  PropertyDetailPage,
  RoomsListPage,
  RoomDetailPage,
  ContractsListPage,
  ContractDetailPage,
  TransactionsListPage,
  TransactionDetailPage,
  TicketsListPage,
  TicketDetailPage,
  CatalogsListPage,
  CatalogDetailPage,
  ItemsListPage,
  ItemDetailPage,
  OverheadsListPage,
  OverheadDetailPage,
} from '@/hawkeye/pages/HawkeyePages';
import { LeadsPage } from '@/hawkeye/pages/LeadsPage';
import { MoveOutOrchestratorPage } from '@/hawkeye/pages/MoveOutOrchestratorPage';
import { SdSettlementPage } from '@/hawkeye/pages/SdSettlementPage';
import { PoApprovalQueuePage } from '@/hawkeye/pages/PoApprovalQueuePage';
import { RentRollPage } from '@/hawkeye/pages/RentRollPage';
import { DepositTrackerPage } from '@/hawkeye/pages/DepositTrackerPage';
import { RentCollectionPage } from '@/hawkeye/pages/RentCollectionPage';
import { PropertyPnlPage } from '@/hawkeye/pages/PropertyPnlPage';
import { PaymentDeadlinesPage } from '@/hawkeye/pages/PaymentDeadlinesPage';
import { ContractApprovalPage } from '@/hawkeye/pages/ContractApprovalPage';
import { DiscountApprovalPage } from '@/hawkeye/pages/DiscountApprovalPage';
import { MoveInApprovalPage } from '@/hawkeye/pages/MoveInApprovalPage';

const RecordIndexPage = lazy(() =>
  import('~/pages/object-record/RecordIndexPage').then((module) => ({
    default: module.RecordIndexPage,
  })),
);

const RecordShowPage = lazy(() =>
  import('~/pages/object-record/RecordShowPage').then((module) => ({
    default: module.RecordShowPage,
  })),
);

const SignInUp = lazy(() =>
  import('~/pages/auth/SignInUp').then((module) => ({
    default: module.SignInUp,
  })),
);

const PasswordReset = lazy(() =>
  import('~/pages/auth/PasswordReset').then((module) => ({
    default: module.PasswordReset,
  })),
);

const Authorize = lazy(() =>
  import('~/pages/auth/Authorize').then((module) => ({
    default: module.Authorize,
  })),
);

const CreateWorkspace = lazy(() =>
  import('~/pages/onboarding/CreateWorkspace').then((module) => ({
    default: module.CreateWorkspace,
  })),
);

const CreateProfile = lazy(() =>
  import('~/pages/onboarding/CreateProfile').then((module) => ({
    default: module.CreateProfile,
  })),
);

const SyncEmails = lazy(() =>
  import('~/pages/onboarding/SyncEmails').then((module) => ({
    default: module.SyncEmails,
  })),
);

const InviteTeam = lazy(() =>
  import('~/pages/onboarding/InviteTeam').then((module) => ({
    default: module.InviteTeam,
  })),
);

const ChooseYourPlan = lazy(() =>
  import('~/pages/onboarding/ChooseYourPlan').then((module) => ({
    default: module.ChooseYourPlan,
  })),
);

const PaymentSuccess = lazy(() =>
  import('~/pages/onboarding/PaymentSuccess').then((module) => ({
    default: module.PaymentSuccess,
  })),
);

const BookCallDecision = lazy(() =>
  import('~/pages/onboarding/BookCallDecision').then((module) => ({
    default: module.BookCallDecision,
  })),
);

const BookCall = lazy(() =>
  import('~/pages/onboarding/BookCall').then((module) => ({
    default: module.BookCall,
  })),
);

const NotFound = lazy(() =>
  import('~/pages/not-found/NotFound').then((module) => ({
    default: module.NotFound,
  })),
);

export const useCreateAppRouter = (
  isFunctionSettingsEnabled?: boolean,
  isAdminPageEnabled?: boolean,
) =>
  createBrowserRouter(
    createRoutesFromElements(
      <>
      <Route path="/hawkeye" element={<HawkeyeProviders />}>
        <Route element={<HawkeyeLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<HawkeyeDashboard />} />
          <Route path="search" element={<HawkeyeGlobalSearch />} />
          <Route path="activity" element={<HawkeyeActivityFeed />} />
          <Route path="settings" element={<HawkeyeSettings />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="tenants" element={<TenantsListPage />} />
          <Route path="tenants/:id" element={<TenantDetailPage />} />
          <Route path="merchants" element={<MerchantsListPage />} />
          <Route path="merchants/:id" element={<MerchantDetailPage />} />
          <Route path="vendors" element={<VendorsListPage />} />
          <Route path="vendors/:id" element={<VendorDetailPage />} />
          <Route path="properties" element={<PropertiesListPage />} />
          <Route path="properties/:id" element={<PropertyDetailPage />} />
          <Route path="rooms" element={<RoomsListPage />} />
          <Route path="rooms/:id" element={<RoomDetailPage />} />
          <Route path="contracts" element={<ContractsListPage />} />
          <Route path="contracts/:id" element={<ContractDetailPage />} />
          <Route path="transactions" element={<TransactionsListPage />} />
          <Route path="transactions/:id" element={<TransactionDetailPage />} />
          <Route path="tickets" element={<TicketsListPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
          <Route path="catalogs" element={<CatalogsListPage />} />
          <Route path="catalogs/:id" element={<CatalogDetailPage />} />
          <Route path="items" element={<ItemsListPage />} />
          <Route path="items/:id" element={<ItemDetailPage />} />
          <Route path="overheads" element={<OverheadsListPage />} />
          <Route path="overheads/:id" element={<OverheadDetailPage />} />
          <Route path="rent-roll" element={<RentRollPage />} />
          <Route path="deposit-tracker" element={<DepositTrackerPage />} />
          <Route path="rent-collection" element={<RentCollectionPage />} />
          <Route path="property-pnl" element={<PropertyPnlPage />} />
          <Route path="payment-deadlines" element={<PaymentDeadlinesPage />} />
          <Route path="move-out" element={<MoveOutOrchestratorPage />} />
          <Route path="sd-settlements" element={<SdSettlementPage />} />
          <Route path="po-approvals" element={<PoApprovalQueuePage />} />
          <Route path="contract-approvals" element={<ContractApprovalPage />} />
          <Route path="discount-approvals" element={<DiscountApprovalPage />} />
          <Route path="move-in-approvals" element={<MoveInApprovalPage />} />
        </Route>
      </Route>
      <Route
        element={<AppRouterProviders />}
        // To switch state to `loading` temporarily to enable us
        // to set scroll position before the page is rendered
        loader={async () => Promise.resolve(null)}
      >
        <Route element={<DefaultLayout />}>
          <Route path={AppPath.Verify} element={<VerifyLoginTokenEffect />} />
          <Route path={AppPath.VerifyEmail} element={<VerifyEmailEffect />} />
          <Route
            path={AppPath.SignInUp}
            element={
              <LazyRoute>
                <SignInUp />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.Invite}
            element={
              <LazyRoute>
                <SignInUp />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.ResetPassword}
            element={
              <LazyRoute>
                <PasswordReset />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.CreateWorkspace}
            element={
              <LazyRoute>
                <CreateWorkspace />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.CreateProfile}
            element={
              <LazyRoute>
                <CreateProfile />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.SyncEmails}
            element={
              <LazyRoute>
                <SyncEmails />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.InviteTeam}
            element={
              <LazyRoute>
                <InviteTeam />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.PlanRequired}
            element={
              <LazyRoute>
                <ChooseYourPlan />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.PlanRequiredSuccess}
            element={
              <LazyRoute>
                <PaymentSuccess />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.BookCallDecision}
            element={
              <LazyRoute>
                <BookCallDecision />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.BookCall}
            element={
              <LazyRoute>
                <BookCall />
              </LazyRoute>
            }
          />
          <Route path={indexAppPath.getIndexAppPath()} element={<></>} />
          <Route
            path={AppPath.RecordIndexPage}
            element={
              <LazyRoute>
                <RecordIndexPage />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.RecordShowPage}
            element={
              <LazyRoute>
                <RecordShowPage />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.SettingsCatchAll}
            element={
              <SettingsRoutes
                isFunctionSettingsEnabled={isFunctionSettingsEnabled}
                isAdminPageEnabled={isAdminPageEnabled}
              />
            }
          />
          <Route
            path={AppPath.NotFoundWildcard}
            element={
              <LazyRoute>
                <NotFound />
              </LazyRoute>
            }
          />
        </Route>
        <Route element={<BlankLayout />}>
          <Route
            path={AppPath.Authorize}
            element={
              <LazyRoute>
                <Authorize />
              </LazyRoute>
            }
          />
        </Route>
      </Route>
      </>,
    ),
  );
