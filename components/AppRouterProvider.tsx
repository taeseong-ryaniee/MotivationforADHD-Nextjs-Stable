'use client'

import * as React from 'react'
import warning from 'tiny-warning'
import type { SubscriberArgs } from '@tanstack/history'
import {
  CatchBoundary,
  ErrorComponent,
  Match,
  RouterContextProvider,
  matchContext,
  useLayoutEffect,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import {
  getLocationChangeInfo,
  handleHashScroll,
  rootRouteId,
  trimPathRight,
} from '@tanstack/router-core'
import { router } from '@/lib/router'

function SafeFragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function Transitioner() {
  const routerInstance = useRouter()
  const mountLoadForRouter = React.useRef({ router: routerInstance, mounted: false })
  const previousIsLoadingRef = React.useRef<boolean | null>(null)
  const previousIsAnyPendingRef = React.useRef<boolean | null>(null)
  const previousIsPagePendingRef = React.useRef<boolean | null>(null)

  const { hasPendingMatches, isLoading } = useRouterState({
    select: (state) => ({
      isLoading: state.isLoading,
      hasPendingMatches: state.matches.some((match) => match.status === 'pending'),
    }),
    structuralSharing: true,
  })

  const isAnyPending = isLoading || hasPendingMatches
  const isPagePending = isLoading || hasPendingMatches

  React.useEffect(() => {
    const unsub = routerInstance.history.subscribe(({ navigateOpts }: SubscriberArgs) => {
      if (navigateOpts?.skipTransitionerLoad) {
        return
      }
      routerInstance.load()
    })

    const nextLocation = routerInstance.buildLocation({
      to: routerInstance.latestLocation.pathname,
      search: true,
      params: true,
      hash: true,
      state: true,
      _includeValidateSearch: true,
    })

    if (
      trimPathRight(routerInstance.latestLocation.publicHref) !==
      trimPathRight(nextLocation.publicHref)
    ) {
      routerInstance.commitLocation({ ...nextLocation, replace: true })
    }

    return () => {
      unsub()
    }
  }, [routerInstance, routerInstance.history])

  useLayoutEffect(() => {
    if (
      (typeof window !== 'undefined' && routerInstance.ssr) ||
      (mountLoadForRouter.current.router === routerInstance &&
        mountLoadForRouter.current.mounted)
    ) {
      return
    }

    mountLoadForRouter.current = { router: routerInstance, mounted: true }

    const tryLoad = async () => {
      try {
        await routerInstance.load()
      } catch (err) {
        console.error(err)
      }
    }

    tryLoad()
  }, [routerInstance])

  useLayoutEffect(() => {
    if (previousIsLoadingRef.current && !isLoading) {
      routerInstance.emit({
        type: 'onLoad',
        ...getLocationChangeInfo(routerInstance.state),
      })
    }
    previousIsLoadingRef.current = isLoading
  }, [routerInstance, isLoading])

  useLayoutEffect(() => {
    if (previousIsPagePendingRef.current && !isPagePending) {
      routerInstance.emit({
        type: 'onBeforeRouteMount',
        ...getLocationChangeInfo(routerInstance.state),
      })
    }
    previousIsPagePendingRef.current = isPagePending
  }, [isPagePending, routerInstance])

  useLayoutEffect(() => {
    if (previousIsAnyPendingRef.current && !isAnyPending) {
      const changeInfo = getLocationChangeInfo(routerInstance.state)
      routerInstance.emit({
        type: 'onResolved',
        ...changeInfo,
      })

      routerInstance.__store.setState((state: typeof routerInstance.state) => ({
        ...state,
        status: 'idle',
        resolvedLocation: state.location,
      }))

      if (changeInfo.hrefChanged) {
        handleHashScroll(routerInstance)
      }
    }
    previousIsAnyPendingRef.current = isAnyPending
  }, [isAnyPending, routerInstance])

  return null
}

function MatchesInner() {
  const routerInstance = useRouter()
  const matchId = useRouterState({
    select: (state) => state.matches[0]?.id,
  })

  const resetKey = useRouterState({
    select: (state) => state.loadedAt,
  })

  const matchComponent = matchId ? <Match matchId={matchId} /> : null

  return (
    <matchContext.Provider value={matchId}>
      {routerInstance.options.disableGlobalCatchBoundary ? (
        matchComponent
      ) : (
        <CatchBoundary
          getResetKey={() => resetKey}
          errorComponent={ErrorComponent}
          onCatch={(error) => {
            warning(
              false,
              `The following error wasn't caught by any route! At the very least, consider setting an 'errorComponent' in your RootRoute!`,
            )
            warning(false, error.message || error.toString())
          }}
        >
          {matchComponent}
        </CatchBoundary>
      )}
    </matchContext.Provider>
  )
}

function Matches() {
  const routerInstance = useRouter()
  const rootRoute = routerInstance.routesById[rootRouteId]

  const PendingComponent =
    rootRoute.options.pendingComponent ?? routerInstance.options.defaultPendingComponent
  const pendingElement = PendingComponent ? <PendingComponent /> : null

  const ResolvedSuspense =
    routerInstance.isServer || (typeof document !== 'undefined' && routerInstance.ssr)
      ? SafeFragment
      : React.Suspense

  const inner = (
    <ResolvedSuspense fallback={pendingElement}>
      {!routerInstance.isServer && <Transitioner />}
      <MatchesInner />
    </ResolvedSuspense>
  )

  return routerInstance.options.InnerWrap ? (
    <routerInstance.options.InnerWrap>{inner}</routerInstance.options.InnerWrap>
  ) : (
    inner
  )
}

export function AppRouterProvider() {
  return (
    <RouterContextProvider router={router}>
      <Matches />
    </RouterContextProvider>
  )
}
