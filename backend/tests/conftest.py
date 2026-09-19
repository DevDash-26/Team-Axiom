"""Shared fixtures. Tests use the configured Postgres URL and roll back each case."""

from __future__ import annotations

import uuid
from collections.abc import AsyncIterator, Generator
from contextlib import asynccontextmanager

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.constants import Faculty, Role
from app.db import get_db, get_engine
from app.main import app
from app.models.user import User
from app.security import get_current_user, get_optional_user


@asynccontextmanager
async def _noop_lifespan(_app) -> AsyncIterator[None]:
    """Skip init_db on each TestClient enter; schema is created by the running app/seed."""
    yield


@pytest.fixture(scope="session", autouse=True)
def _create_schema() -> None:
    if not get_settings().database_url:
        pytest.skip("DATABASE_URL is not set")
    with get_engine().connect() as connection:
        connection.execute(text("SELECT 1"))
    app.router.lifespan_context = _noop_lifespan


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    connection = get_engine().connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    yield session
    session.close()
    transaction.rollback()
    connection.close()


def _add_user(db_session: Session, **kwargs) -> User:
    user = User(
        id=kwargs.pop("id", uuid.uuid4()),
        email=kwargs.pop("email"),
        full_name=kwargs.pop("full_name"),
        role=kwargs.pop("role"),
        faculty=kwargs.pop("faculty", None),
        year=kwargs.pop("year", None),
        programme=kwargs.pop("programme", None),
        society_id=kwargs.pop("society_id", None),
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    return user


@pytest.fixture
def computing_student(db_session: Session) -> User:
    return _add_user(
        db_session,
        email="test.computing@student.ucl.lk",
        full_name="Test Computing",
        role=Role.STUDENT.value,
        faculty=Faculty.COMPUTING.value,
        year=2,
        programme="Software Engineering",
    )


@pytest.fixture
def business_student(db_session: Session) -> User:
    return _add_user(
        db_session,
        email="test.business@student.ucl.lk",
        full_name="Test Business",
        role=Role.STUDENT.value,
        faculty=Faculty.BUSINESS.value,
        year=1,
        programme="Business Management",
    )


@pytest.fixture
def academic_user(db_session: Session) -> User:
    return _add_user(
        db_session,
        email="test.academic@ucl.lk",
        full_name="Test Academic",
        role=Role.ACADEMIC.value,
        faculty=Faculty.COMPUTING.value,
    )


@pytest.fixture
def finance_user(db_session: Session) -> User:
    return _add_user(
        db_session,
        email="test.finance@ucl.lk",
        full_name="Test Finance",
        role=Role.FINANCE.value,
    )


@pytest.fixture
def society_rep_user(db_session: Session) -> User:
    return _add_user(
        db_session,
        email="test.society@student.ucl.lk",
        full_name="Test Society Rep",
        role=Role.SOCIETY_REP.value,
        faculty=Faculty.COMPUTING.value,
        year=3,
        programme="Software Engineering",
    )


@pytest.fixture
def admin_user(db_session: Session) -> User:
    return _add_user(
        db_session,
        email="test.admin@ucl.lk",
        full_name="Test Admin",
        role=Role.ADMIN.value,
    )


def _override_db(db_session: Session) -> None:
    def override() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = override


def bind_user(user: User | None) -> None:
    """Switch the authenticated user on the shared TestClient."""
    if user is None:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_optional_user, None)
        return
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_optional_user] = lambda: user


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    _override_db(db_session)
    bind_user(None)
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def computing_client(client: TestClient, computing_student: User) -> TestClient:
    bind_user(computing_student)
    return client


@pytest.fixture
def business_client(client: TestClient, business_student: User) -> TestClient:
    bind_user(business_student)
    return client


@pytest.fixture
def academic_client(client: TestClient, academic_user: User) -> TestClient:
    bind_user(academic_user)
    return client


@pytest.fixture
def finance_client(client: TestClient, finance_user: User) -> TestClient:
    bind_user(finance_user)
    return client


@pytest.fixture
def society_rep_client(client: TestClient, society_rep_user: User) -> TestClient:
    bind_user(society_rep_user)
    return client


@pytest.fixture
def admin_client(client: TestClient, admin_user: User) -> TestClient:
    bind_user(admin_user)
    return client
